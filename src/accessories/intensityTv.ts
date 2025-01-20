import type { CharacteristicValue, PlatformAccessory } from 'homebridge';
import { HueSyncBoxPlatform } from '../platform';
import { State } from '../state';
import { BaseTvDevice } from './baseTv.js';

export class IntensityTvDevice extends BaseTvDevice {
  constructor(
    protected readonly platform: HueSyncBoxPlatform,
    public readonly accessory: PlatformAccessory,
    protected state: State,
    protected mainAccessory?: PlatformAccessory
  ) {
    super(platform, accessory, state, mainAccessory);

    this.service
      .getCharacteristic(this.platform.api.hap.Characteristic.ActiveIdentifier)
      .onSet((value: CharacteristicValue) => {
        const mode = this.getMode();
        const intensity = this.numberToIntensity.get(value as number) ?? '';
        this.platform.log.debug('Switch intensity to ' + intensity);
        const body = {};
        body[mode] = {
          intensity,
        };
        this.updateExecution(body);
      });
  }

  protected createInputServices() {
    for (const [num, name] of this.numberToIntensity.entries()) {
      const position = 'INTENSITY ' + num;
      const intensityInputService = this.getInputService(name, position);

      // Adds the input as a linked service, which is important so that the input is properly displayed in the Home app
      this.service.addLinkedService(intensityInputService);
      this.inputServices.push(intensityInputService);
    }
    this.service.setCharacteristic(
      this.platform.api.hap.Characteristic.SleepDiscoveryMode,
      this.platform.api.hap.Characteristic.SleepDiscoveryMode
        .ALWAYS_DISCOVERABLE
    );

    this.updateSources(this.inputServices);
  }

  updateTv(): void {
    // Gets the current mode or the last sync mode to set the intensity
    const mode = this.getMode();
    if (!this.state.execution[mode]) {
      this.platform.log.debug(
        'Current mode ' + mode + ' does not have an intensity to update'
      );
      return;
    }

    // Updates the intensity input characteristic
    this.platform.log.debug(
      'Updated intensity to ' + this.state.execution[mode]?.intensity
    );
    const brightness = this.intensityToNumber.get(
      this.state.execution[mode].intensity
    );
    if (brightness) {
      this.service.updateCharacteristic(
        this.platform.api.hap.Characteristic.ActiveIdentifier,
        brightness
      );
    }
  }

  protected getSuffix(): string {
    return '-I';
  }

  protected getServiceSubType(): string | undefined {
    return 'IntensityTVAccessory';
  }

  protected getServiceName(): string | undefined {
    return 'Intensity';
  }

  protected getConfiguredNamePropertyName(): string {
    return 'intensityTvAccessoryConfiguredName';
  }

  protected isLightbulbEnabled(): boolean {
    return this.platform.config.intensityTvAccessoryLightbulb;
  }
}
