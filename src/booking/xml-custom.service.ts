import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class XmlCustomService {
  async parseXmlWithoutLibrary(confirmationNo: string): Promise<any> {
    const xmlFolderPath = path.resolve(__dirname, '../XML');
    const xmlFilePath = path.join(xmlFolderPath, `${confirmationNo}.xml`);
    
    if (!fs.existsSync(xmlFilePath)) {
      throw new Error('File not found');
    }

    const xmlData = fs.readFileSync(xmlFilePath, 'utf-8');
    return this.customXmlParser(xmlData);
  }

  private customXmlParser(xml: string): any {
    const result: any = {};
  
    xml.replace(/<(\w+)>([^<]*)<\/\1>/g, (_, tag, content) => {
      if (!isNaN(Number(content))) {
        content = Number(content);
      }
      result[tag] = content;
      return ''; 
    });
  
    return this.transformToDesiredFormat(result);
  }

  private transformToDesiredFormat(data: any): any {
    return {
      confirmation_no: data.confirmation_no,
      resv_name_id: data.resv_name_id,
      arrival: data.arrival,
      departure: data.departure,
      adults: data.adults,
      children: data.children,
      roomtype: data.roomtype,
      ratecode: data.ratecode,
      rateamount: {
        amount: data.amount,
        currency: data.currency,
      },
      guarantee: data.guarantee,
      method_payment: data.method_payment,
      computed_resv_status: data.computed_resv_status,
      last_name: data.last_name,
      first_name: data.first_name,
      title: data.title,
      phone_number: data.phone_number,
      email: data.email,
      booking_balance: data.booking_balance,
      booking_created_date: data.booking_created_date,
    };
  }
}
