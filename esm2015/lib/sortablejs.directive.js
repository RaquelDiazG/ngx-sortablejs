import { Directive, ElementRef, EventEmitter, Inject, Input, NgZone, Optional, Output, Renderer2 } from '@angular/core';
import Sortable from 'sortablejs';
import { GLOBALS } from './globals';
import { SortablejsBindings } from './sortablejs-bindings';
import { SortablejsService } from './sortablejs.service';
const getIndexesFromEvent = (event) => {
    if (event.hasOwnProperty('newDraggableIndex') && event.hasOwnProperty('oldDraggableIndex')) {
        return {
            new: event.newDraggableIndex,
            old: event.oldDraggableIndex,
        };
    }
    else {
        return {
            new: event.newIndex,
            old: event.oldIndex,
        };
    }
};
const ɵ0 = getIndexesFromEvent;
export class SortablejsDirective {
    constructor(globalConfig, service, element, zone, renderer) {
        this.globalConfig = globalConfig;
        this.service = service;
        this.element = element;
        this.zone = zone;
        this.renderer = renderer;
        this.runInsideAngular = false; // to be deprecated
        this.sortablejsInit = new EventEmitter();
    }
    ngOnInit() {
        if (Sortable && Sortable.create) { // Sortable does not exist in angular universal (SSR)
            if (this.runInsideAngular) {
                this.create();
            }
            else {
                this.zone.runOutsideAngular(() => this.create());
            }
        }
    }
    ngOnChanges(changes) {
        const optionsChange = changes.sortablejsOptions;
        if (optionsChange && !optionsChange.isFirstChange()) {
            const previousOptions = optionsChange.previousValue;
            const currentOptions = optionsChange.currentValue;
            Object.keys(currentOptions).forEach(optionName => {
                if (currentOptions[optionName] !== previousOptions[optionName]) {
                    // use low-level option setter
                    this.sortableInstance.option(optionName, this.options[optionName]);
                }
            });
        }
    }
    ngOnDestroy() {
        if (this.sortableInstance) {
            this.sortableInstance.destroy();
        }
    }
    create() {
        const container = this.sortablejsContainer ? this.element.nativeElement.querySelector(this.sortablejsContainer) : this.element.nativeElement;
        setTimeout(() => {
            this.sortableInstance = Sortable.create(container, this.options);
            this.sortablejsInit.emit(this.sortableInstance);
        }, 0);
    }
    getBindings() {
        if (!this.sortablejs) {
            return new SortablejsBindings([]);
        }
        else if (this.sortablejs instanceof SortablejsBindings) {
            return this.sortablejs;
        }
        else {
            return new SortablejsBindings([this.sortablejs]);
        }
    }
    get options() {
        return Object.assign(Object.assign({}, this.optionsWithoutEvents), this.overridenOptions);
    }
    get optionsWithoutEvents() {
        return Object.assign(Object.assign({}, (this.globalConfig || {})), (this.sortablejsOptions || {}));
    }
    proxyEvent(eventName, ...params) {
        this.zone.run(() => {
            if (this.optionsWithoutEvents && this.optionsWithoutEvents[eventName]) {
                this.optionsWithoutEvents[eventName](...params);
            }
        });
    }
    get isCloning() {
        return this.sortableInstance.options.group.checkPull(this.sortableInstance, this.sortableInstance) === 'clone';
    }
    clone(item) {
        // by default pass the item through, no cloning performed
        return (this.sortablejsCloneFunction || (subitem => subitem))(item);
    }
    get overridenOptions() {
        // always intercept standard events but act only in case items are set (bindingEnabled)
        // allows to forget about tracking this.items changes
        return {
            onAdd: (event) => {
                this.service.transfer = (items) => {
                    this.getBindings().injectIntoEvery(event.newIndex, items);
                    this.proxyEvent('onAdd', event);
                };
                this.proxyEvent('onAddOriginal', event);
            },
            onRemove: (event) => {
                const bindings = this.getBindings();
                if (bindings.provided) {
                    if (this.isCloning) {
                        this.service.transfer(bindings.getFromEvery(event.oldIndex).map(item => this.clone(item)));
                        // great thanks to https://github.com/tauu
                        // event.item is the original item from the source list which is moved to the target list
                        // event.clone is a clone of the original item and will be added to source list
                        // If bindings are provided, adding the item dom element to the target list causes artifacts
                        // as it interferes with the rendering performed by the angular template.
                        // Therefore we remove it immediately and also move the original item back to the source list.
                        // (event handler may be attached to the original item and not its clone, therefore keeping
                        // the original dom node, circumvents side effects )
                        this.renderer.removeChild(event.item.parentNode, event.item);
                        this.renderer.insertBefore(event.clone.parentNode, event.item, event.clone);
                        this.renderer.removeChild(event.clone.parentNode, event.clone);
                    }
                    else {
                        this.service.transfer(bindings.extractFromEvery(event.oldIndex));
                    }
                    this.service.transfer = null;
                }
                this.proxyEvent('onRemove', event);
            },
            onUpdate: (event) => {
                const bindings = this.getBindings();
                const indexes = getIndexesFromEvent(event);
                bindings.injectIntoEvery(indexes.new, bindings.extractFromEvery(indexes.old));
                this.proxyEvent('onUpdate', event);
            },
        };
    }
}
SortablejsDirective.decorators = [
    { type: Directive, args: [{
                selector: '[sortablejs]',
            },] }
];
SortablejsDirective.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [GLOBALS,] }] },
    { type: SortablejsService },
    { type: ElementRef },
    { type: NgZone },
    { type: Renderer2 }
];
SortablejsDirective.propDecorators = {
    sortablejs: [{ type: Input }],
    sortablejsContainer: [{ type: Input }],
    sortablejsOptions: [{ type: Input }],
    sortablejsCloneFunction: [{ type: Input }],
    runInsideAngular: [{ type: Input }],
    sortablejsInit: [{ type: Output }]
};
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydGFibGVqcy5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtc29ydGFibGVqcy9zcmMvbGliL3NvcnRhYmxlanMuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBZ0MsUUFBUSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQWdCLE1BQU0sZUFBZSxDQUFDO0FBQ3BLLE9BQU8sUUFBUSxNQUFNLFlBQVksQ0FBQztBQUNsQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRXBDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRTNELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRXpELE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxLQUFvQixFQUFFLEVBQUU7SUFDbkQsSUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDLG1CQUFtQixDQUFDLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFO1FBQ3hGLE9BQU87WUFDTCxHQUFHLEVBQUUsS0FBSyxDQUFDLGlCQUFpQjtZQUM1QixHQUFHLEVBQUUsS0FBSyxDQUFDLGlCQUFpQjtTQUM3QixDQUFDO0tBQ0w7U0FBTTtRQUNMLE9BQU87WUFDTCxHQUFHLEVBQUUsS0FBSyxDQUFDLFFBQVE7WUFDbkIsR0FBRyxFQUFFLEtBQUssQ0FBQyxRQUFRO1NBQ3BCLENBQUM7S0FDSDtBQUNILENBQUMsQ0FBQzs7QUFLRixNQUFNLE9BQU8sbUJBQW1CO0lBb0I5QixZQUN1QyxZQUErQixFQUM1RCxPQUEwQixFQUMxQixPQUFtQixFQUNuQixJQUFZLEVBQ1osUUFBbUI7UUFKVSxpQkFBWSxHQUFaLFlBQVksQ0FBbUI7UUFDNUQs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SSxDQUFDO2lCQUM5QjtnQkFFRCxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNyQyxDQUFDO1lBQ0QsUUFBUSxFQUFFLENBQUMsS0FBb0IsRUFBRSxFQUFFO2dCQUNqQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3BDLE1BQU0sT0FBTyxHQUFHLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUUzQyxRQUFRLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUM5RSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNyQyxDQUFDO1NBQ0YsQ0FBQztJQUNKLENBQUM7OztZQTFKRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGNBQWM7YUFDekI7Ozs0Q0FzQkksUUFBUSxZQUFJLE1BQU0sU0FBQyxPQUFPO1lBeEN0QixpQkFBaUI7WUFOTixVQUFVO1lBQStCLE1BQU07WUFBa0QsU0FBUzs7O3lCQTJCM0gsS0FBSztrQ0FHTCxLQUFLO2dDQUdMLEtBQUs7c0NBR0wsS0FBSzsrQkFLTCxLQUFLOzZCQUVMLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIEV2ZW50RW1pdHRlciwgSW5qZWN0LCBJbnB1dCwgTmdab25lLCBPbkNoYW5nZXMsIE9uRGVzdHJveSwgT25Jbml0LCBPcHRpb25hbCwgT3V0cHV0LCBSZW5kZXJlcjIsIFNpbXBsZUNoYW5nZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IFNvcnRhYmxlIGZyb20gJ3NvcnRhYmxlanMnO1xuaW1wb3J0IHsgR0xPQkFMUyB9IGZyb20gJy4vZ2xvYmFscyc7XG5pbXBvcnQgeyBTb3J0YWJsZWpzQmluZGluZ1RhcmdldCB9IGZyb20gJy4vc29ydGFibGVqcy1iaW5kaW5nLXRhcmdldCc7XG5pbXBvcnQgeyBTb3J0YWJsZWpzQmluZGluZ3MgfSBmcm9tICcuL3NvcnRhYmxlanMtYmluZGluZ3MnO1xuaW1wb3J0IHsgU29ydGFibGVqc09wdGlvbnMgfSBmcm9tICcuL3NvcnRhYmxlanMtb3B0aW9ucyc7XG5pbXBvcnQgeyBTb3J0YWJsZWpzU2VydmljZSB9IGZyb20gJy4vc29ydGFibGVqcy5zZXJ2aWNlJztcblxuY29uc3QgZ2V0SW5kZXhlc0Zyb21FdmVudCA9IChldmVudDogU29ydGFibGVFdmVudCkgPT4ge1xuICBpZiAoZXZlbnQuaGFzT3duUHJvcGVydHkoJ25ld0RyYWdnYWJsZUluZGV4JykgJiYgZXZlbnQuaGFzT3duUHJvcGVydHkoJ29sZERyYWdnYWJsZUluZGV4JykpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5ldzogZXZlbnQubmV3RHJhZ2dhYmxlSW5kZXgsXG4gICAgICAgIG9sZDogZXZlbnQub2xkRHJhZ2dhYmxlSW5kZXgsXG4gICAgICB9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB7XG4gICAgICBuZXc6IGV2ZW50Lm5ld0luZGV4LFxuICAgICAgb2xkOiBldmVudC5vbGRJbmRleCxcbiAgICB9O1xuICB9XG59O1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbc29ydGFibGVqc10nLFxufSlcbmV4cG9ydCBjbGFzcyBTb3J0YWJsZWpzRGlyZWN0aXZlIGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XG5cbiAgQElucHV0KClcbiAgc29ydGFibGVqczogU29ydGFibGVqc0JpbmRpbmdUYXJnZXQ7IC8vIGFycmF5IG9yIGEgRm9ybUFycmF5XG5cbiAgQElucHV0KClcbiAgc29ydGFibGVqc0NvbnRhaW5lcjogc3RyaW5nO1xuXG4gIEBJbnB1dCgpXG4gIHNvcnRhYmxlanNPcHRpb25zOiBTb3J0YWJsZWpzT3B0aW9ucztcblxuICBASW5wdXQoKVxuICBzb3J0YWJsZWpzQ2xvbmVGdW5jdGlvbjogPFQ+KGl0ZW06IFQpID0+IFQ7XG5cbiAgcHJpdmF0ZSBzb3J0YWJsZUluc3RhbmNlOiBhbnk7XG5cbiAgQElucHV0KCkgcnVuSW5zaWRlQW5ndWxhciA9IGZhbHNlOyAvLyB0byBiZSBkZXByZWNhdGVkXG5cbiAgQE91dHB1dCgpIHNvcnRhYmxlanNJbml0ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoR0xPQkFMUykgcHJpdmF0ZSBnbG9iYWxDb25maWc6IFNvcnRhYmxlanNPcHRpb25zLFxuICAgIHByaXZhdGUgc2VydmljZTogU29ydGFibGVqc1NlcnZpY2UsXG4gICAgcHJpdmF0ZSBlbGVtZW50OiBFbGVtZW50UmVmLFxuICAgIHByaXZhdGUgem9uZTogTmdab25lLFxuICAgIHByaXZhdGUgcmVuZGVyZXI6IFJlbmRlcmVyMixcbiAgKSB7IH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICBpZiAoU29ydGFibGUgJiYgU29ydGFibGUuY3JlYXRlKSB7IC8vIFNvcnRhYmxlIGRvZXMgbm90IGV4aXN0IGluIGFuZ3VsYXIgdW5pdmVyc2FsIChTU1IpXG4gICAgICBpZiAodGhpcy5ydW5JbnNpZGVBbmd1bGFyKSB7XG4gICAgICAgIHRoaXMuY3JlYXRlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gdGhpcy5jcmVhdGUoKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogeyBbcHJvcCBpbiBrZXlvZiBTb3J0YWJsZWpzRGlyZWN0aXZlXTogU2ltcGxlQ2hhbmdlIH0pIHtcbiAgICBjb25zdCBvcHRpb25zQ2hhbmdlOiBTaW1wbGVDaGFuZ2UgPSBjaGFuZ2VzLnNvcnRhYmxlanNPcHRpb25zO1xuXG4gICAgaWYgKG9wdGlvbnNDaGFuZ2UgJiYgIW9wdGlvbnNDaGFuZ2UuaXNGaXJzdENoYW5nZSgpKSB7XG4gICAgICBjb25zdCBwcmV2aW91c09wdGlvbnM6IFNvcnRhYmxlanNPcHRpb25zID0gb3B0aW9uc0NoYW5nZS5wcmV2aW91c1ZhbHVlO1xuICAgICAgY29uc3QgY3VycmVudE9wdGlvbnM6IFNvcnRhYmxlanNPcHRpb25zID0gb3B0aW9uc0NoYW5nZS5jdXJyZW50VmFsdWU7XG5cbiAgICAgIE9iamVjdC5rZXlzKGN1cnJlbnRPcHRpb25zKS5mb3JFYWNoKG9wdGlvbk5hbWUgPT4ge1xuICAgICAgICBpZiAoY3VycmVudE9wdGlvbnNbb3B0aW9uTmFtZV0gIT09IHByZXZpb3VzT3B0aW9uc1tvcHRpb25OYW1lXSkge1xuICAgICAgICAgIC8vIHVzZSBsb3ctbGV2ZWwgb3B0aW9uIHNldHRlclxuICAgICAgICAgIHRoaXMuc29ydGFibGVJbnN0YW5jZS5vcHRpb24ob3B0aW9uTmFtZSwgdGhpcy5vcHRpb25zW29wdGlvbk5hbWVdKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuc29ydGFibGVJbnN0YW5jZSkge1xuICAgICAgdGhpcy5zb3J0YWJsZUluc3RhbmNlLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZSgpIHtcbiAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLnNvcnRhYmxlanNDb250YWluZXIgPyB0aGlzLmVsZW1lbnQubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc29ydGFibGVqc0NvbnRhaW5lcikgOiB0aGlzLmVsZW1lbnQubmF0aXZlRWxlbWVudDtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5zb3J0YWJsZUluc3RhbmNlID0gU29ydGFibGUuY3JlYXRlKGNvbnRhaW5lciwgdGhpcy5vcHRpb25zKTtcbiAgICAgIHRoaXMuc29ydGFibGVqc0luaXQuZW1pdCh0aGlzLnNvcnRhYmxlSW5zdGFuY2UpO1xuICAgIH0sIDApO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRCaW5kaW5ncygpOiBTb3J0YWJsZWpzQmluZGluZ3Mge1xuICAgIGlmICghdGhpcy5zb3J0YWJsZWpzKSB7XG4gICAgICByZXR1cm4gbmV3IFNvcnRhYmxlanNCaW5kaW5ncyhbXSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnNvcnRhYmxlanMgaW5zdGFuY2VvZiBTb3J0YWJsZWpzQmluZGluZ3MpIHtcbiAgICAgIHJldHVybiB0aGlzLnNvcnRhYmxlanM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgU29ydGFibGVqc0JpbmRpbmdzKFt0aGlzLnNvcnRhYmxlanNdKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldCBvcHRpb25zKCkge1xuICAgIHJldHVybiB7IC4uLnRoaXMub3B0aW9uc1dpdGhvdXRFdmVudHMsIC4uLnRoaXMub3ZlcnJpZGVuT3B0aW9ucyB9O1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgb3B0aW9uc1dpdGhvdXRFdmVudHMoKSB7XG4gICAgcmV0dXJuIHsgLi4uKHRoaXMuZ2xvYmFsQ29uZmlnIHx8IHt9KSwgLi4uKHRoaXMuc29ydGFibGVqc09wdGlvbnMgfHwge30pIH07XG4gIH1cblxuICBwcml2YXRlIHByb3h5RXZlbnQoZXZlbnROYW1lOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10pIHtcbiAgICB0aGlzLnpvbmUucnVuKCgpID0+IHsgLy8gcmUtZW50ZXJpbmcgem9uZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9Tb3J0YWJsZUpTL2FuZ3VsYXItc29ydGFibGVqcy9pc3N1ZXMvMTEwI2lzc3VlY29tbWVudC00MDg4NzQ2MDBcbiAgICAgIGlmICh0aGlzLm9wdGlvbnNXaXRob3V0RXZlbnRzICYmIHRoaXMub3B0aW9uc1dpdGhvdXRFdmVudHNbZXZlbnROYW1lXSkge1xuICAgICAgICB0aGlzLm9wdGlvbnNXaXRob3V0RXZlbnRzW2V2ZW50TmFtZV0oLi4ucGFyYW1zKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IGlzQ2xvbmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5zb3J0YWJsZUluc3RhbmNlLm9wdGlvbnMuZ3JvdXAuY2hlY2tQdWxsKHRoaXMuc29ydGFibGVJbnN0YW5jZSwgdGhpcy5zb3J0YWJsZUluc3RhbmNlKSA9PT0gJ2Nsb25lJztcbiAgfVxuXG4gIHByaXZhdGUgY2xvbmU8VD4oaXRlbTogVCk6IFQge1xuICAgIC8vIGJ5IGRlZmF1bHQgcGFzcyB0aGUgaXRlbSB0aHJvdWdoLCBubyBjbG9uaW5nIHBlcmZvcm1lZFxuICAgIHJldHVybiAodGhpcy5zb3J0YWJsZWpzQ2xvbmVGdW5jdGlvbiB8fCAoc3ViaXRlbSA9PiBzdWJpdGVtKSkoaXRlbSk7XG4gIH1cblxuICBwcml2YXRlIGdldCBvdmVycmlkZW5PcHRpb25zKCk6IFNvcnRhYmxlanNPcHRpb25zIHtcbiAgICAvLyBhbHdheXMgaW50ZXJjZXB0IHN0YW5kYXJkIGV2ZW50cyBidXQgYWN0IG9ubHkgaW4gY2FzZSBpdGVtcyBhcmUgc2V0IChiaW5kaW5nRW5hYmxlZClcbiAgICAvLyBhbGxvd3MgdG8gZm9yZ2V0IGFib3V0IHRyYWNraW5nIHRoaXMuaXRlbXMgY2hhbmdlc1xuICAgIHJldHVybiB7XG4gICAgICBvbkFkZDogKGV2ZW50OiBTb3J0YWJsZUV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuc2VydmljZS50cmFuc2ZlciA9IChpdGVtczogYW55W10pID0+IHtcbiAgICAgICAgICB0aGlzLmdldEJpbmRpbmdzKCkuaW5qZWN0SW50b0V2ZXJ5KGV2ZW50Lm5ld0luZGV4LCBpdGVtcyk7XG4gICAgICAgICAgdGhpcy5wcm94eUV2ZW50KCdvbkFkZCcsIGV2ZW50KTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnByb3h5RXZlbnQoJ29uQWRkT3JpZ2luYWwnLCBldmVudCk7XG4gICAgICB9LFxuICAgICAgb25SZW1vdmU6IChldmVudDogU29ydGFibGVFdmVudCkgPT4ge1xuICAgICAgICBjb25zdCBiaW5kaW5ncyA9IHRoaXMuZ2V0QmluZGluZ3MoKTtcblxuICAgICAgICBpZiAoYmluZGluZ3MucHJvdmlkZWQpIHtcbiAgICAgICAgICBpZiAodGhpcy5pc0Nsb25pbmcpIHtcbiAgICAgICAgICAgIHRoaXMuc2VydmljZS50cmFuc2ZlcihiaW5kaW5ncy5nZXRGcm9tRXZlcnkoZXZlbnQub2xkSW5kZXgpLm1hcChpdGVtID0+IHRoaXMuY2xvbmUoaXRlbSkpKTtcblxuICAgICAgICAgICAgLy8gZ3JlYXQgdGhhbmtzIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS90YXV1XG4gICAgICAgICAgICAvLyBldmVudC5pdGVtIGlzIHRoZSBvcmlnaW5hbCBpdGVtIGZyb20gdGhlIHNvdXJjZSBsaXN0IHdoaWNoIGlzIG1vdmVkIHRvIHRoZSB0YXJnZXQgbGlzdFxuICAgICAgICAgICAgLy8gZXZlbnQuY2xvbmUgaXMgYSBjbG9uZSBvZiB0aGUgb3JpZ2luYWwgaXRlbSBhbmQgd2lsbCBiZSBhZGRlZCB0byBzb3VyY2UgbGlzdFxuICAgICAgICAgICAgLy8gSWYgYmluZGluZ3MgYXJlIHByb3ZpZGVkLCBhZGRpbmcgdGhlIGl0ZW0gZG9tIGVsZW1lbnQgdG8gdGhlIHRhcmdldCBsaXN0IGNhdXNlcyBhcnRpZmFjdHNcbiAgICAgICAgICAgIC8vIGFzIGl0IGludGVyZmVyZXMgd2l0aCB0aGUgcmVuZGVyaW5nIHBlcmZvcm1lZCBieSB0aGUgYW5ndWxhciB0ZW1wbGF0ZS5cbiAgICAgICAgICAgIC8vIFRoZXJlZm9yZSB3ZSByZW1vdmUgaXQgaW1tZWRpYXRlbHkgYW5kIGFsc28gbW92ZSB0aGUgb3JpZ2luYWwgaXRlbSBiYWNrIHRvIHRoZSBzb3VyY2UgbGlzdC5cbiAgICAgICAgICAgIC8vIChldmVudCBoYW5kbGVyIG1heSBiZSBhdHRhY2hlZCB0byB0aGUgb3JpZ2luYWwgaXRlbSBhbmQgbm90IGl0cyBjbG9uZSwgdGhlcmVmb3JlIGtlZXBpbmdcbiAgICAgICAgICAgIC8vIHRoZSBvcmlnaW5hbCBkb20gbm9kZSwgY2lyY3VtdmVudHMgc2lkZSBlZmZlY3RzIClcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXIucmVtb3ZlQ2hpbGQoZXZlbnQuaXRlbS5wYXJlbnROb2RlLCBldmVudC5pdGVtKTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXIuaW5zZXJ0QmVmb3JlKGV2ZW50LmNsb25lLnBhcmVudE5vZGUsIGV2ZW50Lml0ZW0sIGV2ZW50LmNsb25lKTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXIucmVtb3ZlQ2hpbGQoZXZlbnQuY2xvbmUucGFyZW50Tm9kZSwgZXZlbnQuY2xvbmUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNlcnZpY2UudHJhbnNmZXIoYmluZGluZ3MuZXh0cmFjdEZyb21FdmVyeShldmVudC5vbGRJbmRleCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuc2VydmljZS50cmFuc2ZlciA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnByb3h5RXZlbnQoJ29uUmVtb3ZlJywgZXZlbnQpO1xuICAgICAgfSxcbiAgICAgIG9uVXBkYXRlOiAoZXZlbnQ6IFNvcnRhYmxlRXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgYmluZGluZ3MgPSB0aGlzLmdldEJpbmRpbmdzKCk7XG4gICAgICAgIGNvbnN0IGluZGV4ZXMgPSBnZXRJbmRleGVzRnJvbUV2ZW50KGV2ZW50KTtcblxuICAgICAgICBiaW5kaW5ncy5pbmplY3RJbnRvRXZlcnkoaW5kZXhlcy5uZXcsIGJpbmRpbmdzLmV4dHJhY3RGcm9tRXZlcnkoaW5kZXhlcy5vbGQpKTtcbiAgICAgICAgdGhpcy5wcm94eUV2ZW50KCdvblVwZGF0ZScsIGV2ZW50KTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG59XG5cbmludGVyZmFjZSBTb3J0YWJsZUV2ZW50IHtcbiAgb2xkSW5kZXg6IG51bWJlcjtcbiAgbmV3SW5kZXg6IG51bWJlcjtcbiAgb2xkRHJhZ2dhYmxlSW5kZXg/OiBudW1iZXI7XG4gIG5ld0RyYWdnYWJsZUluZGV4PzogbnVtYmVyO1xuICBpdGVtOiBIVE1MRWxlbWVudDtcbiAgY2xvbmU6IEhUTUxFbGVtZW50O1xufVxuIl19