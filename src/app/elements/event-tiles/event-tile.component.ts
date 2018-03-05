import {
    Component, ComponentFactoryResolver, ComponentRef, Input, OnDestroy, OnInit, Type, ViewChild,
    ViewContainerRef
} from "@angular/core";
import { MatrixRoom } from "../../models/matrix/dto/room";
import { MessageEventTileComponent } from "./message/message.component";
import { RoomEvent } from "../../models/matrix/events/room/room-event";
import { MemberEventTileComponent } from "./member/member.component";
import { EventTileComponentBase } from "./event-tile.component.base";

interface TileMap {
    [eventType: string]: Type<EventTileComponentBase>;
}

let cachedTileMap: TileMap;

@Component({
    selector: "my-event-tile",
    templateUrl: "./event-tile.component.html",
    styleUrls: ["./event-tile.component.scss"]
})
export class EventTileComponent implements OnInit, OnDestroy {

    @ViewChild('wrapper', {read: ViewContainerRef}) public wrapper: ViewContainerRef;

    @Input() public event: RoomEvent;
    @Input() public room: MatrixRoom;

    private componentRef: ComponentRef<EventTileComponentBase>;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {
    }

    public ngOnInit() {
        if (!this.event || !this.room) return;

        const componentType = this.tileMap[this.event.type];
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

    private get tileMap(): TileMap {
        // This is done as a instance getter with an external cache property to ensure that
        // the component classes are fully set up by the time we need them. If this map
        // was created as a regular static property then we'd have the issue of components
        // being seen as undefined.
        if (!cachedTileMap) {
            cachedTileMap = {
                'm.room.message': MessageEventTileComponent,
                'm.room.member': MemberEventTileComponent,
            };
        }

        return cachedTileMap;
    }

    public get previousEvent(): RoomEvent {
        const idx = this.room.timeline.indexOf(this.event);
        if (idx > 0) return this.room.timeline[idx - 1];
        return null;
    }
}