import {IListItem} from 'davinci.js';

export interface ListActions<T> {

    select(item: IListItem<T>);

    reverseSelection();

    cancelSelection();

    acceptSelection();
}
