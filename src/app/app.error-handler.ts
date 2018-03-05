import { ErrorHandler, Injectable } from "@angular/core";

@Injectable()
export class AppErrorHandler implements ErrorHandler {
    public handleError(e) {
        console.error(e);
    }
}