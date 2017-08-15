import { Blend4WebModule } from './b4w-module';
import { Injectable } from '@angular/core';

declare var b4w: any;

@Injectable()
export class Blend4WebService {
    GetModule(moduleName: string): Blend4WebModule {
        return b4w.require(moduleName + '_main');
    }

    InitModule(module: Blend4WebModule) {
        b4w.register(module.name + '_main', module.context);
        b4w.require(module.name + '_main').init();
    }
}
