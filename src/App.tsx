import React, { Component } from 'react';
import './App.styles.scss';

interface Payment {
  prevDate: Date;
  prevAmount: number;
  prevInterest: number;
  prevPrinciple: number;
  prevExtra: any;
}

type AppState = {
  startingDate: Date;
  principle: number;
  interestRate: string;
  monthlyTaxes: number;
  years: number;
  extraPayments: string[];
}

class App extends Component<{}, AppState> {
  constructor(props: any) {
    super(props);

    let pastPayments: string[];
    let paymentStorage: string|null;
    let startDate: Date;
    let dateStorage: string|null;
    let principle: number;
    let principleStorage: string|null;
    let interestRate: string;
    let interestRateStorage: string|null;
    let years: number;
    let yearsStorage: string|null;

    paymentStorage = localStorage.getItem('payments');
    dateStorage = localStorage.getItem('startingDate');
    principleStorage = localStorage.getItem('principle');
    interestRateStorage = localStorage.getItem('interestRate');
    yearsStorage = localStorage.getItem('years');

    if(paymentStorage) {
      pastPayments = JSON.parse(paymentStorage);
    }
    else {
      pastPayments = Array.apply(null, new Array(360)).map(String.prototype.valueOf, '0');
    }

    if(dateStorage) {
      startDate = new Date(dateStorage);
    }
    else {
      startDate = new Date(`${(new Date()).getMonth() + 1}, ${(new Date()).getDate()}, ${(new Date()).getFullYear()}`);
    }

    if(principleStorage) {
      principle = parseFloat(principleStorage);
    }
    else {
      principle = 0;
    }

    if(interestRateStorage) {
      interestRate = interestRateStorage;
    }
    else {
      interestRate = '0';
    }

    if(yearsStorage) {
      years = parseFloat(yearsStorage);
    }
    else {
      years = 0;
    }

    this.state = {
      startingDate: startDate,
      principle: principle,
      interestRate: interestRate,
      monthlyTaxes: 292.04,
      years: years,
      extraPayments: pastPayments,
    };
  }

  thousandsSeparator = (number: number): string => {

    return (number).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  render() {
    let { startingDate, principle, interestRate, monthlyTaxes, years, extraPayments }: AppState = this.state;

    const monthlyInterestRate: number = (parseFloat(interestRate) ?? 0) / 12;

    const numberOfPayments: number = years * 12;
    const monthlyPayment: number = (principle * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1));
    const monthlyInterest: number = principle * monthlyInterestRate;
    const monthlyPrinciple: number = monthlyPayment - monthlyInterest;
    
    let payments: Payment[] = [{
      prevDate: startingDate,
      prevAmount: principle,
      prevInterest: monthlyInterest,
      prevPrinciple: monthlyPrinciple,
      prevExtra: extraPayments[0].length ? extraPayments[0] : 0,
    }];

    for(let i: number = 1; i < numberOfPayments; i++) {
      let { prevDate, prevAmount, prevInterest, prevPrinciple, prevExtra }: Payment = payments[i - 1];
      let newAmount: number = prevAmount - prevPrinciple;
      let extra;

      if(prevExtra.length) {
        newAmount -= parseFloat(prevExtra);
      }

      if(extraPayments[i].length) {
        extra = extraPayments[i];
      }
      else {
        extra = 0;
      }

      if(prevDate.getMonth() >= 12) {
        prevDate.setMonth(0);
        prevDate.setFullYear(prevDate.getFullYear() + 1);
      }
      else {
        prevDate.setMonth(prevDate.getMonth() + 1);
      }

      payments.push({
        prevDate: new Date(`${prevDate.getMonth() + 1}, ${prevDate.getDate()}, ${prevDate.getFullYear()}`),
        prevAmount: newAmount, 
        prevInterest: ((newAmount * monthlyInterestRate)),
        prevPrinciple: ((monthlyPayment - (newAmount * monthlyInterestRate))),
        prevExtra: extra,
      });
    }

    let lastPayment = payments[payments.length - 1].prevDate;
    if(lastPayment.getMonth() >= 12) {
      lastPayment.setMonth(0);
      lastPayment.setFullYear(lastPayment.getFullYear() + 1);
    }
    else {
      lastPayment.setMonth(lastPayment.getMonth() + 1);
    }

    payments[payments.length - 1].prevDate = lastPayment;

    const updateYears = (years: string): void => {
      let parsedYears = isNaN(parseFloat(years)) ? 0 : parseFloat(years);
      this.setState({
        years: parsedYears,
      })

      localStorage.setItem('years', parsedYears.toString());
    }

    const updateInterestRate = (interestRate: string): void => {
      let parsedInterestRate = isNaN(parseFloat(interestRate)) ? '' : interestRate;
      this.setState({
        interestRate: parsedInterestRate,
      })

      localStorage.setItem('interestRate', parsedInterestRate.toString());
    }

    const updatePrinciple = (principle: string): void => {
      let parsedPrinciple = isNaN(parseFloat(principle)) ? 0 : parseFloat(principle);
      this.setState({
        principle: parsedPrinciple,
      })

      localStorage.setItem('principle', parsedPrinciple.toString());
    }

    const updateDate = (date: string): void => {
      this.setState({
        startingDate: new Date(date),
      })

      localStorage.setItem('startingDate', date);
    }

    const updateExtra = (extra: string, i: number): void => {

      let newPayments = extraPayments.map((payment, index) => {
        if(i === index) {
          return extra;
        }

        return payment;
      });

      this.setState({
        extraPayments: newPayments
      });

      localStorage.setItem('payments', JSON.stringify(newPayments));
    }

    let date = startingDate.getDate();
    let month = startingDate.getMonth() + 1;
    let year = startingDate.getFullYear();

    return (
      <div className='App'>
        <div className='container'>
          <h1 className='text-center my-5'>Amortization Schedule</h1>
          <div className='table-responsive text-center'>
            <div className="d-flex justify-content-center">
              <div className="w-50">
                <label htmlFor='years' className="align-elements">Years:</label>
                <input 
                  type='number' 
                  id='years'
                  value={years <= 0 ? '' : years} 
                  onChange={(e) => updateYears(e.target.value)} 
                />
              </div>
              <div className="w-50">
                <label htmlFor='interestRate' className="align-elements">Interest Rate:</label>
                <input 
                  type='number' 
                  id='interestRate'
                  value={interestRate} 
                  step='0.01'
                  onChange={(e) => updateInterestRate(e.target.value)} 
                />
              </div>
            </div>
            <div className="d-flex justify-content-center">
              <div className="w-50">
                <label htmlFor='principle' className="align-elements">Principle:</label>
                <input 
                  type='number' 
                  id='principle'
                  value={principle <= 0 ? '' : principle} 
                  onChange={(e) => updatePrinciple(e.target.value)} 
                />
              </div>
              <div className="w-50">
                <label htmlFor='startingDate' className="align-elements">Starting Date:</label>
                <input 
                  type='date' 
                  id='startingDate'
                  value={`${year}-${month < 10 ? `0${month}` : month}-${date < 10 ? `0${date}` : date}`} 
                  onChange={(e) => updateDate(e.target.value)} 
                />
              </div>
            </div>
            <table className='table table-striped table-hover table-sm mb-0'>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Left to Pay</th>
                  <th>Monthly Interest</th>
                  <th>Monthly Principle</th>
                  <th>Monthly Extra</th>
                </tr>
              </thead>
              <tbody>
                {
                  payments.filter((payment) => payment.prevAmount >= 0).map((payment, index) => (
                    <tr key={index}>
                      <td>{`${payment.prevDate.getMonth() + 1}/${payment.prevDate.getDate()}/${payment.prevDate.getFullYear()}`}</td>
                      <td>${this.thousandsSeparator(parseFloat((payment.prevAmount).toFixed(2)))}</td>
                      <td>${this.thousandsSeparator(parseFloat((payment.prevInterest).toFixed(2)))}</td>
                      <td>${this.thousandsSeparator(parseFloat((payment.prevPrinciple).toFixed(2)))}</td>
                      <td><input type='string' value={extraPayments[index]} onChange={(e) => updateExtra(e.target.value, index)} /></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
