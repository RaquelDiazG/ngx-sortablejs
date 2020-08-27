import { NgModule } from '@angular/core';
import { GLOBALS } from './globals';
import { SortablejsDirective } from './sortablejs.directive';
export class SortablejsModule {
    static forRoot(globalOptions) {
        return {
            ngModule: SortablejsModule,
            providers: [
                { provide: GLOBALS, useValue: globalOptions },
            ],
        };
    }
}
SortablejsModule.decorators = [
    { type: NgModule, args: [{
                declarations: [SortablejsDirective],
                exports: [SortablejsDirective],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydGFibGVqcy5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtc29ydGFibGVqcy9zcmMvbGliL3NvcnRhYmxlanMubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBdUIsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzlELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFcEMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFNN0QsTUFBTSxPQUFPLGdCQUFnQjtJQUVwQixNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWdDO1FBQ3BELE9BQU87WUFDTCxRQUFRLEVBQUUsZ0JBQWdCO1lBQzFCLFNBQVMsRUFBRTtnQkFDVCxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRTthQUM5QztTQUNGLENBQUM7SUFDSixDQUFDOzs7WUFiRixRQUFRLFNBQUM7Z0JBQ1IsWUFBWSxFQUFFLENBQUMsbUJBQW1CLENBQUM7Z0JBQ25DLE9BQU8sRUFBRSxDQUFDLG1CQUFtQixDQUFDO2FBQy9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEdMT0JBTFMgfSBmcm9tICcuL2dsb2JhbHMnO1xuaW1wb3J0IHsgU29ydGFibGVqc09wdGlvbnMgfSBmcm9tICcuL3NvcnRhYmxlanMtb3B0aW9ucyc7XG5pbXBvcnQgeyBTb3J0YWJsZWpzRGlyZWN0aXZlIH0gZnJvbSAnLi9zb3J0YWJsZWpzLmRpcmVjdGl2ZSc7XG5cbkBOZ01vZHVsZSh7XG4gIGRlY2xhcmF0aW9uczogW1NvcnRhYmxlanNEaXJlY3RpdmVdLFxuICBleHBvcnRzOiBbU29ydGFibGVqc0RpcmVjdGl2ZV0sXG59KVxuZXhwb3J0IGNsYXNzIFNvcnRhYmxlanNNb2R1bGUge1xuXG4gIHB1YmxpYyBzdGF0aWMgZm9yUm9vdChnbG9iYWxPcHRpb25zOiBTb3J0YWJsZWpzT3B0aW9ucyk6IE1vZHVsZVdpdGhQcm92aWRlcnM8U29ydGFibGVqc01vZHVsZT4ge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogU29ydGFibGVqc01vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7IHByb3ZpZGU6IEdMT0JBTFMsIHVzZVZhbHVlOiBnbG9iYWxPcHRpb25zIH0sXG4gICAgICBdLFxuICAgIH07XG4gIH1cblxufVxuIl19