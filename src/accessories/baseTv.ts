import { SyncBoxDevice } from './base.js';
import {
  type CharacteristicValue,
  PlatformAccessory,
  Service,
} from 'homebridge';
import { HueSyncBoxPlatform } from '../platform';
import { State } from '../state';
import { PASSTHROUGH, POWER_SAVE } from '../lib/constants.js';

export abstract class BaseTvDevice extends SyncBoxDevice {
  protected lightbulbService?: Service;
  protected inputServices: Service[] = [];
  protected mainAccessory?: PlatformAccessory;

  protected readonly intensityToNumber: Map<string, number> = new Map([
    ['subtle', 1],
    ['moderate', 2],
    ['high', 3],
    ['intense', 4],
  ]);

  protected readonly numberToIntensity: Map<number, string> = new Map([
    [1, 'subtle'],
    [2, 'moderate'],
    [3, 'high'],
    [4, 'intense'],
  ]);

  protected readonly modeToNumber: Map<string, number> = new Map([
    ['video', 1],
    ['music', 2],
    ['game', 3],
    ['passthrough', 4],
  ]);

  protected readonly numberToMode: Map<number, string> = new Map([
    [1, 'video'],
    [2, 'music'],
    [3, 'game'],
    [4, 'passthrough'],
  ]);

  protected constructor(
    protected readonly platform: HueSyncBoxPlatform,
    public readonly accessory: PlatformAccessory,
    protected state: State,
    protected primaryAccessory?: PlatformAccessory
  ) {
    super(platform, accessory, state);
    this.mainAccessory = primaryAccessory;

    this.createInputServices();
    this.createLightbulbService();
    this.service.setCharacteristic(
      this.platform.api.hap.Characteristic.SleepDiscoveryMode,
      this.platform.api.hap.Characteristic.SleepDiscoveryMode
        .ALWAYS_DISCOVERABLE
    );
    this.service
      .getCharacteristic(this.platform.api.hap.Characteristic.RemoteKey)
      .onSet(this.handleRemoteButton.bind(this));

    let name;
    if (this.platform.config[this.getConfiguredNamePropertyName()]) {
      name = this.platform.config[this.getConfiguredNamePropertyName()];
    } else if (
      this.mainAccessory?.context[this.getConfiguredNamePropertyName()]
    ) {
      name = this.mainAccessory?.context[this.getConfiguredNamePropertyName()];
    } else {
      name = this.state.device.name;
    }
    this.service
      .getCharacteristic(this.platform.api.hap.Characteristic.ConfiguredName)
      .onSet(this.handleConfiguredNameChange.bind(this));
    this.service.setCharacteristic(
      this.platform.api.hap.Characteristic.ConfiguredName,
      name
    );
  }

  protected handleConfiguredNameChange(value: CharacteristicValue) {
    if (this.platform.config[this.getConfiguredNamePropertyName()]) {
      this.platform.log.warn(
        this.getConfiguredNamePropertyName() +
          ' is set in' +
          'the config, cannot be changed by HomeKit. Please change it in the' +
          'Homebridge config. Alternatively remove the config and manually' +
          'configure in HomeKit (not recommended).'
      );
      return;
    }
    this.platform.log.debug(
      this.getConfiguredNamePropertyName() + ' name changed to ' + value
    );
    if (this.mainAccessory) {
      this.mainAccessory.context[this.getConfiguredNamePropertyName()] = value;
    }
  }

  protected abstract createInputServices(): void;

  protected abstract isLightbulbEnabled(): boolean;

  protected createLightbulbService(): void {
    if (!this.isLightbulbEnabled()) {
      return;
    }
    this.lightbulbService =
      this.accessory.getService(this.platform.api.hap.Service.Lightbulb) ||
      this.accessory.addService(this.platform.api.hap.Service.Lightbulb);

    // Stores the light bulb service

    // Subscribes for changes of the on characteristic
    this.lightbulbService
      .getCharacteristic(this.platform.api.hap.Characteristic.On)
      .onSet(this.setOnLightbulb.bind(this));

    // Subscribes for changes of the brightness characteristic
    this.lightbulbService
      .getCharacteristic(this.platform.api.hap.Characteristic.Brightness)
      .onSet(this.setBrightness.bind(this));
  }

  setOnLightbulb(value: CharacteristicValue) {
    if (!this.lightbulbService) {
      return;
    }
    this.platform.log.debug('Set On ->', value);
    const currentVal = this.lightbulbService.getCharacteristic(
      this.platform.api.hap.Characteristic.On
    ).value;
    return this.updateMode(currentVal, value);
  }

  protected getServiceType() {
    return this.platform.api.hap.Service.Television;
  }

  protected handleRemoteButton(value: CharacteristicValue) {
    this.platform.log.debug('Remote key pressed: ' + value);

    let mode: string;
    switch (value) {
      case this.platform.api.hap.Characteristic.RemoteKey.ARROW_UP:
        this.platform.log.debug('Increase brightness by 25%');
        this.updateExecution({
          brightness: Math.min(200, this.state.execution.brightness + 50),
        });
        break;

      case this.platform.api.hap.Characteristic.RemoteKey.ARROW_DOWN:
        this.platform.log.debug('Decrease brightness by 25%');
        this.updateExecution({
          brightness: Math.max(0, this.state.execution.brightness - 50),
        });
        break;

      case this.platform.api.hap.Characteristic.RemoteKey.ARROW_LEFT: {
        // Gets the current mode or the last sync mode to set the intensity
        mode = this.getMode();

        this.platform.log.debug('Toggle intensity');
        const currentIntensity = this.state.execution[mode].intensity;
        const nextLowestIntensity =
          (this.intensityToNumber.get(currentIntensity) ?? 4) - 1;
        if (nextLowestIntensity < 1) {
          break;
        }
        const nextIntensity = this.numberToIntensity.get(nextLowestIntensity);
        const body = {};
        body[mode] = {
          intensity: nextIntensity,
        };
        this.updateExecution(body);
        break;
      }

      case this.platform.api.hap.Characteristic.RemoteKey.ARROW_RIGHT: {
        // Gets the current mode or the last sync mode to set the intensity
        mode = this.getMode();

        this.platform.log.debug('Toggle intensity');
        const currentIntensity = this.state.execution[mode].intensity;
        const nextHighestIntensity =
          (this.intensityToNumber.get(currentIntensity) ?? 1) + 1;
        if (nextHighestIntensity > 4) {
          break;
        }
        const nextIntensity = this.numberToIntensity.get(nextHighestIntensity);
        const body = {};
        body[mode] = {
          intensity: nextIntensity,
        };
        this.updateExecution(body);
        break;
      }

      case this.platform.api.hap.Characteristic.RemoteKey.SELECT: {
        this.platform.log.debug('Toggle mode');
        const currentMode = this.state.execution.mode;
        const nextMode = ((this.modeToNumber.get(currentMode) ?? 4) % 4) + 1;
        this.updateExecution({
          mode: this.numberToMode.get(nextMode),
        });
        break;
      }

      case this.platform.api.hap.Characteristic.RemoteKey.PLAY_PAUSE:
        this.platform.log.debug('Toggle switch state');
        if (
          this.state.execution.mode !== POWER_SAVE &&
          this.state.execution.mode !== PASSTHROUGH
        ) {
          this.updateExecution({
            mode: this.platform.config.defaultOffMode,
          });
        } else {
          let onMode: string = this.platform.config.defaultOnMode;
          if (onMode === 'lastSyncMode') {
            onMode = this?.state?.execution?.lastSyncMode ?? 'video';
          }

          this.updateExecution({
            mode: onMode,
          });
        }
        break;

      case this.platform.api.hap.Characteristic.RemoteKey.INFORMATION: {
        this.platform.log.debug('Toggle hdmi source');
        const hdmiSource = this.state.execution.hdmiSource;
        const currentSourcePosition = parseInt(hdmiSource.replace('input', ''));
        const nextSourcePosition = (currentSourcePosition % 4) + 1;
        this.updateExecution({
          hdmiSource: 'input' + nextSourcePosition,
        });
        break;
      }
    }
  }

  protected updateSources(services: Service[]) {
    // Handles showing/hiding of sources
    for (const service of services) {
      service
        .getCharacteristic(
          this.platform.api.hap.Characteristic.TargetVisibilityState
        )
        .onSet(this.setVisibility(service));
    }
  }

  public update(state: State): void {
    super.update(state);
    this.updateTv();
    this.updateLightbulb();
  }

  protected abstract updateTv(): void;

  private updateLightbulb(): void {
    if (!this.lightbulbService) {
      return;
    }
    this.platform.log.debug('Updated state to ' + this.state.execution.mode);
    this.lightbulbService.updateCharacteristic(
      this.platform.api.hap.Characteristic.On,
      this.state.execution.mode !== POWER_SAVE &&
        this.state.execution.mode !== PASSTHROUGH
    );
    this.platform.log.debug(
      'Updated brightness to ' + this.state.execution.brightness
    );
    this.lightbulbService.updateCharacteristic(
      this.platform.api.hap.Characteristic.Brightness,
      Math.round((this.state.execution.brightness / 200.0) * 100)
    );
  }

  protected getInputService(
    name: string | undefined,
    position: string
  ): Service {
    if (!name) {
      throw new Error('Name is required');
    }
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    this.platform.log.debug('Creating input service for ' + capitalizedName);
    const inputService =
      this.accessory.getServiceById(
        this.platform.api.hap.Service.InputSource,
        position
      ) ||
      this.accessory.addService(
        this.platform.api.hap.Service.InputSource,
        position.toLowerCase().replace(' ', ''),
        position
      );

    // Sets the TV name
    inputService
      .setCharacteristic(
        this.platform.api.hap.Characteristic.ConfiguredName,
        capitalizedName
      )
      .setCharacteristic(
        this.platform.api.hap.Characteristic.IsConfigured,
        this.platform.api.hap.Characteristic.IsConfigured.CONFIGURED
      )
      .setCharacteristic(
        this.platform.api.hap.Characteristic.CurrentVisibilityState,
        this.platform.api.hap.Characteristic.CurrentVisibilityState.SHOWN
      )
      .setCharacteristic(
        this.platform.api.hap.Characteristic.TargetVisibilityState,
        this.platform.api.hap.Characteristic.TargetVisibilityState.SHOWN
      );
    inputService
      .setCharacteristic(
        this.platform.api.hap.Characteristic.Identifier,
        position[position.length - 1]
      )
      .setCharacteristic(
        this.platform.api.hap.Characteristic.InputSourceType,
        this.platform.api.hap.Characteristic.InputSourceType.HDMI
      );

    return inputService;
  }

  protected setVisibility(service: Service) {
    return (value: CharacteristicValue) => {
      service.setCharacteristic(
        this.platform.api.hap.Characteristic.CurrentVisibilityState,
        value
      );
    };
  }

  protected getMode() {
    let mode = 'video';
    if (
      this.state.execution.mode !== POWER_SAVE &&
      this.state.execution.mode !== PASSTHROUGH
    ) {
      mode = this.state.execution.mode;
    } else if (this.state.execution.lastSyncMode) {
      mode = this.state.execution.lastSyncMode;
    }
    return mode;
  }

  protected abstract getConfiguredNamePropertyName(): string;
}
