/*
 *     Evelium - A matrix client
 *     Copyright (C)  2018 Travis Ralston
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { AfterContentChecked, Directive, ElementRef, EventEmitter, HostListener, Input, Output } from "@angular/core";

// Based on: http://resolvethis.com/how-to-create-an-auto-grow-directive-in-angular-2/

@Directive({
    selector: '[myElastic]',
})
export class ElasticDirective implements AfterContentChecked {

    @Input() public minHeight = 0;
    @Input() public defaultHeight: number;
    @Input() public maxHeight = Infinity;
    @Output() public onResize: EventEmitter<any> = new EventEmitter<any>();

    constructor(public element: ElementRef) {
    }

    public ngAfterContentChecked(): void {
        this.adjust();
    }

    @HostListener('input', ['$event.target'])
    public onInput(_textArea: HTMLTextAreaElement): void {
        this.adjust();
    }

    public adjust(): void {
        let nativeElement = this.element.nativeElement;
        nativeElement.style.overflow = 'hidden';
        nativeElement.style.height = 'auto';

        let newHeight = Math.min(this.maxHeight, Math.max(this.minHeight, nativeElement.scrollHeight));

        if (this.defaultHeight) {
            const val = nativeElement.value || "";
            const hasNewline = val.indexOf('\n') >= 0;

            // HACK: This is a workaround for the composer having a tall scrollHeight by default
            if (!val || !hasNewline) newHeight = this.defaultHeight;
        }

        nativeElement.style.height = newHeight + "px";
        this.onResize.emit();
    }
}