import {Component, Input, OnInit} from 'angular2/core';
import { TAG_NAMES, TAG_PROPERTIES } from './tags.constants';

export interface TagSpecification {
    type: string;
    content: string;
}

@Component({
    selector: 'ng2-helmet',
    template: `<div>hi</div>`
})

export default class Ng2Helmet implements OnInit {
    @Input() title: any;
    @Input() meta: any;
    private HELMET_ATTRIBUTE = 'data-ng2-helmet';

    constructor() { }

    ngOnInit() {
      this._generateTags(this.meta);
      this._updateTitle(this.title);
      this._updateTags('meta', this.meta);
    }

    private _updateTitle(title: string) {
      document.title = title || document.title;
    };

    private _generateTags(tags: any): void {
      const headElement = document.head || document.querySelector('head');
      tags.forEach((tag: any) => {
        const newElement = document.createElement('meta');
        Object.keys(tag).map(attribute => {
          newElement.setAttribute(attribute, tag[attribute]);
          newElement.setAttribute(this.HELMET_ATTRIBUTE, 'true');
        });
        headElement.appendChild(newElement);
      });
    };

    private _generateTitleAsString(type: string, title: string) {
        const stringifiedMarkup = `<${type} ${this.HELMET_ATTRIBUTE}="true">${this._encodeSpecialCharacters(title) }</${type}>`;

        return stringifiedMarkup;
    }

    private _encodeSpecialCharacters(str: string) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    };

    private _updateTags(type: any, tags: any) {
        const headElement = document.head || document.querySelector('head');
        // find tags that helmet is managing
        const tagNodes = headElement.querySelectorAll(`${type}[${this.HELMET_ATTRIBUTE}]`);
        const oldTags = Array.prototype.slice.call(tagNodes);
        const newTags: Array<any> = [];
        let indexToDelete: any;

        if (tags && tags.length) {
            tags
                .forEach((tag: any) => {
                const newElement = document.createElement(type);

                for (const attribute in tag) {
                    if (tag.hasOwnProperty(attribute)) {
                        if (attribute === 'innerHTML') {
                            newElement.innerHTML = tag.innerHTML;
                        } else {
                            newElement.setAttribute(attribute, tag[attribute]);
                        }
                    }
                }

                newElement.setAttribute(this.HELMET_ATTRIBUTE, 'true');

                // Remove a duplicate tag from domTagstoRemove, so it isn't cleared.
                if (oldTags.some((existingTag: any, index: number) => {
                    indexToDelete = index;
                    return newElement.isEqualNode(existingTag);
                })) {
                    oldTags.splice(indexToDelete, 1);
                } else {
                    newTags.push(newElement);
                }
            });
        }

        oldTags.forEach((tag: any) => tag.parentNode.removeChild(tag));
        newTags.forEach((tag: any) => headElement.appendChild(tag));

        return {
            oldTags,
            newTags
        };
    };
}
