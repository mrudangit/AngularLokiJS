import { Component, OnInit } from '@angular/core';
import { MarketData } from './MarketData';
import loki from 'lokijs';

@Component({
  selector: 'rubicon-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit{
  title = 'rubicon-data';

  private db = new loki('marketdata');


  columnDefs = [
    { field: 'Description' },
    { field: 'Market' },
    { field: 'BidPrice'},
    { field: 'AskPrice'},
    { field: 'BidQty'},
    { field: 'AskQty'}
  ];

  rowData: Array<MarketData> = new Array<MarketData>();
  lokiMarketData: any;
  lokiMarketDataRealized: any;
  private dv: any;

  private generateMarketData(description: string, market: string): MarketData{
    const md = new MarketData();
    md.Description = description;
    md.Market =  market;
    md.BidPrice = Math.random()*100;
    md.AskPrice = Math.random()*100;
    md.BidQty = Math.random()*100;
    md.AskQty = Math.random()*100;
    return  md;
  }

  ngOnInit(): void {
    console.log('OnInit');


    this.rowData.push(this.generateMarketData('IBM', 'AMEX'));
    this.rowData.push(this.generateMarketData('AAPL', 'AMEX'));
    this.rowData.push(this.generateMarketData('WFC', 'AMEX'));
    this.rowData.push(this.generateMarketData('GE', 'AMEX'));
    this.rowData.push(this.generateMarketData('HP', 'AMEX'));
    this.rowData.push(this.generateMarketData('ZOOM', 'NYSE'));
    this.rowData.push(this.generateMarketData('TSLA', 'NYSE'));
    this.rowData.push(this.generateMarketData('JPM', 'NYSE'));
    this.rowData.push(this.generateMarketData('AA', 'NYSE'));
    this.rowData.push(this.generateMarketData('GS', 'NYSE'));


    this.lokiMarketData = new loki.Collection('MarketData',{unique: ['Description']});
    this.lokiMarketData.insert(this.rowData);

    this.dv = this.lokiMarketData.addDynamicView('LiveMarketData');

    const tx = [
      {
        type: 'offset',
        value: '[%lktxp]pageStart'
      },
      {
        type: 'limit',
        value: '[%lktxp]pageSize'
      }
    ];
    this.lokiMarketData.addTransform('viewPaging', tx);

    this.dv.applyWhere(function(obj) {
      return obj.BidPrice < 50;
    });


    this.dv = this.dv.applySortCriteria([['AskQty', true]]);



  //  this.lokiMarketDataRealized = dv.data();

    setInterval(() => {
      const index = Math.floor(Math.random()* this.rowData.length);
      this.rowData[index].BidPrice = Math.random()*100;
      this.lokiMarketData.update(this.rowData[index]);

      this.lokiMarketDataRealized = this.dv.data();
    }, 1000);


  }
}
