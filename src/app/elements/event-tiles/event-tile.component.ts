import {
    Component, ComponentFactoryResolver, ComponentRef, Input, OnDestroy, OnInit, Type, ViewChild,
    ViewContainerRef
} from "@angular/core";
import { MatrixRoom } from "../../models/matrix/dto/room";
import { MessageEventTileComponent } from "./message/message.component";
import { RoomEvent } from "../../models/matrix/events/room/room-event";

export abstract class DynamicEventTileComponent {
    @Input() event: RoomEvent;
    @Input() previousEvent: RoomEvent;
    @Input() room: MatrixRoom;
}

interface TileMap {
    [eventType: string]: Type<DynamicEventTileComponent>;
}

@Component({
    selector: "my-event-tile",
    templateUrl: "./event-tile.component.html",
    styleUrls: ["./event-tile.component.scss"]
})
export class EventTileComponent implements OnInit, OnDestroy {

    private static get TILE_MAP(): TileMap {
        return {
            'm.room.message': MessageEventTileComponent,
        };
    }

    @ViewChild('wrapper', {read: ViewContainerRef}) public wrapper: ViewContainerRef;

    @Input() public event: RoomEvent;
    @Input() public room: MatrixRoom;

    private componentRef: ComponentRef<DynamicEventTileComponent>;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {
    }

    public ngOnInit() {
        if (!this.event || !this.room) return;

        const componentType = EventTileComponent.TILE_MAP[this.event.type];
        if (!componentType) {
            console.warn("Cannot render event of type " + this.event.type);
            return;
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
        this.componentRef = this.wrapper.createComponent(factory);

        this.componentRef.instance.event = this.event;
        this.componentRef.instance.room = this.room;
        this.componentRef.instance.previousEvent = this.previousEvent;
    }

    public ngOnDestroy() {
        if (this.componentRef) {
            this.componentRef.destroy();
            this.componentRef = null; // just to clean up
        }
    }

    public get previousEvent(): RoomEvent {
        const idx = this.room.timeline.indexOf(this.event);
        if (idx > 0) return this.room.timeline[idx - 1];
        return null;
    }
}