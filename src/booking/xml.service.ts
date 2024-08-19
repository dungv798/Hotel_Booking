import { Injectable } from '@nestjs/common';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { DOMParser } from 'xmldom';
import { parseStringPromise } from 'xml2js';

@Injectable()
export class XmlService {
  private readonly bookingDataPath = join(process.cwd(), 'src', 'XML');

  async parseXmlWithLibrary(confirmationNo: string): Promise<any> {
    const filePath = join(this.bookingDataPath, `booking_${confirmationNo}.xml`);
    if (!existsSync(filePath)) {
      throw new Error('File not found');
    }

    const xmlData = readFileSync(filePath, 'utf8');
    const jsonData = await parseStringPromise(xmlData);
    if (!jsonData) {
      throw new Error('Invalid XML structure');
    }

    return jsonData;
  }

  parseXmlWithoutLibrary(confirmationNo: string): any {
    const filePath = join(this.bookingDataPath, `booking_${confirmationNo}.xml`);
    if (!existsSync(filePath)) {
      throw new Error('File not found');
    }

    const xmlData = readFileSync(filePath, 'utf8');
    const domParser = new DOMParser();
    const doc = domParser.parseFromString(xmlData, 'application/xml');
    return this.xmlElementToJson(doc.documentElement);
  }

  private xmlElementToJson(element: any): any {
    const obj: any = {};

    if (element.attributes && element.attributes.length > 0) {
      for (let i = 0; i < element.attributes.length; i++) {
        const attribute = element.attributes[i];
        obj[attribute.nodeName] = attribute.nodeValue;
      }
    }

    if (element.childNodes && element.childNodes.length > 0) {
      for (let i = 0; i < element.childNodes.length; i++) {
        const item = element.childNodes.item(i);
        if (item.nodeType === 1) {
          const nodeName = item.nodeName;
          if (typeof obj[nodeName] === 'undefined') {
            obj[nodeName] = this.xmlElementToJson(item);
          } else {
            if (!Array.isArray(obj[nodeName])) {
              obj[nodeName] = [obj[nodeName]];
            }
            obj[nodeName].push(this.xmlElementToJson(item));
          }
        } else if (item.nodeType === 3) {
          const textContent = item.nodeValue?.trim();
          if (textContent) {
            obj['#text'] = textContent;
          }
        }
      }
    }

    return obj;
  }

  storeBookingData(confirmationNo: string, data: any): void {
    const filePath = join(this.bookingDataPath, `stored_booking_${confirmationNo}.json`);
    writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  getStoredBookingData(confirmationNo: string): any {
    const filePath = join(this.bookingDataPath, `stored_booking_${confirmationNo}.json`);
    if (!existsSync(filePath)) {
      throw new Error('Booking data not found');
    }
    return JSON.parse(readFileSync(filePath, 'utf8'));
  }
}
