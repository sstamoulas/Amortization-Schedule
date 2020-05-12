import React, { Component } from 'react';
import './App.styles.scss';

interface Payment {
  paymentDate: Date;
  totalAmount: number;
  interest: number;
  principle: number;
  extra: number;
}

type AppState = {
  startingDate: Date;
  principle: number;
  interestRate: string;
  monthlyTaxes: number;
  years: number;
  currentMortgage: number;
  fixedAmount: number;
}

class App extends Component<{}, AppState> {
  constructor(props: any) {
    super(props);

    let fixedAmount: number;
    let fixedAmountStorage: string|null;
    let principle: number;
    let principleStorage: string|null;
    let interestRate: string;
    let interestRateStorage: string|null;
    let years: number;
    let yearsStorage: string|null;
    let currentMortgage: number;
    let currentMortgageStorage: string|null;
    let taxes: number;
    let taxesStorage: string|null;

    fixedAmountStorage = localStorage.getItem('fixedAmount');
    principleStorage = localStorage.getItem('principle');
    interestRateStorage = localStorage.getItem('interestRate');
    yearsStorage = localStorage.getItem('years');
    currentMortgageStorage = localStorage.getItem('currentMortgage');
    taxesStorage = localStorage.getItem('taxes');

    if(fixedAmountStorage) {
      fixedAmount = parseFloat(fixedAmountStorage);
    }
    else {
      fixedAmount = 0;
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

    if(currentMortgageStorage) {
      currentMortgage = parseFloat(currentMortgageStorage);
    }
    else {
      currentMortgage = 0;
    }

    if(taxesStorage) {
      taxes = parseFloat(taxesStorage);
    }
    else {
      taxes = 0;
    }

    this.state = {
      startingDate: new Date(),
      principle: principle, //181,360.95
      interestRate: interestRate, //.0385
      monthlyTaxes: taxes, //292.04
      years: years, //26
      currentMortgage: currentMortgage, //737.50
      fixedAmount: fixedAmount,
    };
  }

  thousandsSeparator = (number: number): string => {
    return (number).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  render() {
    let { startingDate, principle, interestRate, monthlyTaxes, years, currentMortgage, fixedAmount }: AppState = this.state;

    const monthlyInterestRate: number = (parseFloat(interestRate) ?? 0) / 12;
    let mortgage: number = currentMortgage - monthlyTaxes;
    let newInterest: number = (principle * monthlyInterestRate);
    let newPrinciple: number = (mortgage - newInterest);
    let payments: Payment[];
    let totalInterest: number = newInterest;

    if(years > 0) {
      let numberOfPayments: number = years * 12;
      let monthlyPayment: number = principle / numberOfPayments;
      let newExtraPayment: number = (monthlyPayment - newPrinciple);

      payments = [{
        paymentDate: startingDate,
        totalAmount: principle,
        interest: newInterest,
        principle: newPrinciple,
        extra: newExtraPayment < 0 ? 0 : newExtraPayment,
      }];

      for(let i: number = 0; i < numberOfPayments; i++) {
        let { paymentDate }: Payment = payments[i];

        if(paymentDate.getMonth() > 12) {
          paymentDate.setMonth(0);
          paymentDate.setFullYear(paymentDate.getFullYear() + 1);
        }
        else if(i > 0) {
          paymentDate.setMonth(paymentDate.getMonth() + 1);
        }

        newInterest = (payments[i].totalAmount * monthlyInterestRate);
        newPrinciple  = (mortgage - newInterest);
        newExtraPayment = (monthlyPayment - newPrinciple);
        let newTotalAmount: number = newExtraPayment < 0 ? 
          (payments[i].totalAmount - newPrinciple)
        :
          (payments[i].totalAmount - newPrinciple - newExtraPayment);

        totalInterest += newInterest;

        payments.push({
          paymentDate: new Date(`${paymentDate.getMonth() + 1}, ${paymentDate.getDate()}, ${paymentDate.getFullYear()}`),
          totalAmount: newTotalAmount, 
          interest: newInterest,
          principle: newPrinciple,
          extra: newExtraPayment < 0 ? 0 : newExtraPayment,
        });
      }

      let lastPayment = payments[payments.length - 1].paymentDate;
      if(lastPayment.getMonth() >= 12) {
        lastPayment.setMonth(0);
        lastPayment.setFullYear(lastPayment.getFullYear() + 1);
      }
      else {
        lastPayment.setMonth(lastPayment.getMonth() + 1);
      }

      payments[payments.length - 1].paymentDate = lastPayment;
    }
    else {
      let newExtraPayment: number = fixedAmount;
      
      payments = [{
        paymentDate: startingDate,
        totalAmount: principle,
        interest: newInterest,
        principle: newPrinciple,
        extra: newExtraPayment < 0 ? 0 : newExtraPayment,
      }];

      while(payments[payments.length - 1].totalAmount > 0) {
        let { paymentDate, totalAmount }: Payment = payments[payments.length - 1];
        
        if(paymentDate.getMonth() > 12) {
          paymentDate.setMonth(0);
          paymentDate.setFullYear(paymentDate.getFullYear() + 1);
        }
        else {
          paymentDate.setMonth(paymentDate.getMonth() + 1);
        }

        newInterest = (totalAmount * monthlyInterestRate);
        newPrinciple  = (mortgage - newInterest);
        newExtraPayment = fixedAmount;
        let newTotalAmount: number = newExtraPayment < 0 ? 
          (totalAmount - newPrinciple)
        :
          (totalAmount - newPrinciple - newExtraPayment);

        totalInterest += newInterest;

        payments.push({
          paymentDate: new Date(`${paymentDate.getMonth() + 1}, ${paymentDate.getDate()}, ${paymentDate.getFullYear()}`),
          totalAmount: newTotalAmount, 
          interest: newInterest,
          principle: newPrinciple,
          extra: newExtraPayment < 0 ? 0 : newExtraPayment,
        });
      }
    }

    const updateYears = (years: string): void => {
      let parsedYears = isNaN(parseFloat(years)) ? 0 : parseFloat(years);
      this.setState({
        years: parsedYears,
        fixedAmount: 0,
      })

      localStorage.setItem('years', parsedYears.toString());
      localStorage.setItem('fixedAmount', (0).toString());
    }

    const updateTaxes = (taxes: string): void => {
      let parsedTaxes = isNaN(parseFloat(taxes)) ? 0 : parseFloat(taxes);
      this.setState({
        monthlyTaxes: parsedTaxes,
      })

      localStorage.setItem('taxes', parsedTaxes.toString());
    }

    const updateMortgage = (mortgage: string): void => {
      let parsedMortgage = isNaN(parseFloat(mortgage)) ? 0 : parseFloat(mortgage);
      this.setState({
        currentMortgage: parsedMortgage,
      })

      localStorage.setItem('currentMortgage', parsedMortgage.toString());
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

    const updateFixedAmount = (extra: string): void => {
      let parsedFixedAmount = isNaN(parseFloat(extra)) ? 0 : parseFloat(extra);
      this.setState({
        fixedAmount: parsedFixedAmount,
        years: 0,
      })

      localStorage.setItem('fixedAmount', parsedFixedAmount.toString());
      localStorage.setItem('years', (0).toString());
    }

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
                <label htmlFor='taxes' className="align-elements">Monthly Taxes:</label>
                <input 
                  type='number' 
                  id='taxes'
                  value={monthlyTaxes <= 0 ? '' : monthlyTaxes} 
                  onChange={(e) => updateTaxes(e.target.value)} 
                />
              </div>
              <div className="w-50">
                <label htmlFor='mortgage' className="align-elements">Mortgage:</label>
                <input
                  type='number'
                  id='mortgage'
                  value={currentMortgage <= 0 ? '' : currentMortgage}
                  onChange={(e) => updateMortgage(e.target.value)}
                />
              </div>
            </div>
            <div className="d-flex justify-content-center">
              <div className="w-50">
                <label htmlFor='principle' className="align-elements">Loan Amount:</label>
                <input 
                  type='number' 
                  id='principle'
                  value={principle <= 0 ? '' : principle} 
                  onChange={(e) => updatePrinciple(e.target.value)} 
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
              <div className="w-50">
                <label htmlFor='extra' className="align-elements">Fixed Monthly Extra:</label>
                <input 
                  type='number' 
                  id='extra'
                  value={fixedAmount <= 0 ? '' : fixedAmount}
                  onChange={(e) => updateFixedAmount(e.target.value)} 
                />
              </div>
            </div>
            <div>Total Interest Paid: ${this.thousandsSeparator(parseFloat((totalInterest).toFixed(2)))}</div>
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
                  payments.filter((payment) => payment.totalAmount >= 0).map((payment, index) => (
                    <tr key={index}>
                      <td>{`${payment.paymentDate.getMonth() + 1}/${payment.paymentDate.getDate()}/${payment.paymentDate.getFullYear()}`}</td>
                      <td>${this.thousandsSeparator(parseFloat((payment.totalAmount).toFixed(2)))}</td>
                      <td>${this.thousandsSeparator(parseFloat((payment.interest).toFixed(2)))}</td>
                      <td>${this.thousandsSeparator(parseFloat((payment.principle).toFixed(2)))}</td>
                      <td>${this.thousandsSeparator(parseFloat((payment.extra).toFixed(2)))}</td>
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
