import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const formatINR = (number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(number));
};

const calculateEMI = (principal, annualRate, years) => {
  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  return emi;
};

const generateAmortizationSchedule = (principal, annualRate, years) => {
  const schedule = {};
  const monthlyRate = annualRate / 12 / 100;
  const emi = calculateEMI(principal, annualRate, years);
  let balance = principal;

  for (let i = 0; i < years * 12; i++) {
    const interest = balance * monthlyRate;
    const principalPaid = emi - interest;
    balance -= principalPaid;
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    const year = date.getFullYear();
    const month = date.toLocaleString("default", { month: "short" });

    if (!schedule[year]) schedule[year] = [];
    schedule[year].push({ month, principalPaid, interest, emi, balance });
  }
  return schedule;
};

const EMIApp = () => {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(7.5);
  const [loanTenure, setLoanTenure] = useState(5);
  const [showAmortization, setShowAmortization] = useState(false);
  const [openYears, setOpenYears] = useState({});
  const [visibleYears, setVisibleYears] = useState(4);

  const handleInputChange = (setter) => (e) => {
    const value = e.target.value.replace(/^0+/, "");
    setter(Number(value));
  };

  const emi = calculateEMI(loanAmount, interestRate, loanTenure);
  const totalPayment = emi * loanTenure * 12;
  const totalInterest = totalPayment - loanAmount;
  const schedule = generateAmortizationSchedule(
    loanAmount,
    interestRate,
    loanTenure
  );

  const toggleYear = (year) => {
    setOpenYears((prevState) => ({
      ...prevState,
      [year]: !prevState[year],
    }));
  };

  const years = Object.keys(schedule);
  const visibleYearList = years.slice(0, visibleYears);

  const handleToggleMore = () => {
    if (visibleYears < years.length) {
      setVisibleYears((prev) => Math.min(prev + 4, years.length));
    } else {
      setVisibleYears(4);
      setOpenYears({});
    }
  };

  return (
    <Container className="my-5">
      <Card className="shadow-sm p-4">
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Loan amount</Form.Label>
              <div className="d-flex align-items-center gap-3">
                <Form.Control
                  type="number"
                  min={100000}
                  max={5000000}
                  step={50000}
                  value={loanAmount}
                  onChange={handleInputChange(setLoanAmount)}
                />
                <Form.Range
                  min={100000}
                  max={5000000}
                  step={50000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                />
              </div>
              <div className="bg-light p-2 rounded mt-2">
                {formatINR(loanAmount)}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rate of interest (p.a)</Form.Label>
              <div className="d-flex align-items-center gap-3">
                <Form.Control
                  type="number"
                  min={1}
                  max={20}
                  step={0.1}
                  value={interestRate}
                  onChange={handleInputChange(setInterestRate)}
                />
                <Form.Range
                  min={1}
                  max={20}
                  step={0.1}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                />
              </div>
              <div className="bg-light p-2 rounded mt-2">
                {interestRate.toFixed(1)}%
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Loan tenure</Form.Label>
              <div className="d-flex align-items-center gap-3">
                <Form.Control
                  type="number"
                  min={1}
                  max={30}
                  value={loanTenure}
                  onChange={handleInputChange(setLoanTenure)}
                />
                <Form.Range
                  min={1}
                  max={30}
                  value={loanTenure}
                  onChange={(e) => setLoanTenure(Number(e.target.value))}
                />
              </div>
              <div className="bg-light p-2 rounded mt-2">
                {loanTenure} Yr
              </div>
            </Form.Group>
          </Col>

          <Col md={6} className="d-flex flex-column justify-content-center">
            <div className="border border-success rounded overflow-hidden">
              <div className="bg-success bg-opacity-10 text-center py-3">
                <div className="text-muted fs-6">Your Monthly EMI Payment</div>
                <div className="text-success fw-bold display-6">
                  {formatINR(emi)}
                </div>
              </div>
              <div className="p-4">
                <div className="d-flex justify-content-between mb-2">
                  <div>Principal Amount</div>
                  <div className="fw-semibold">{formatINR(loanAmount)}</div>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <div>Total Interest</div>
                  <div className="fw-semibold">{formatINR(totalInterest)}</div>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <div className="fw-bold">Total Amount</div>
                  <div className="fw-bold">{formatINR(totalPayment)}</div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <div className="text-center mt-4">
          <Button
            variant="success"
            onClick={() => setShowAmortization(!showAmortization)}
          >
            Amortization Details
          </Button>
        </div>

        {showAmortization && (
          <div className="mt-4">
            {visibleYearList.map((year, index) => (
              <Card key={index} className="mb-2">
                <Card.Header
                  onClick={() => toggleYear(year)}
                  style={{ cursor: "pointer" }}
                >
                  <strong>{year}</strong>
                </Card.Header>
                {openYears[year] && (
                  <Card.Body>
                    <div className="table-responsive">
                      <table className="table table-bordered table-hover bg-light">
                        <thead className="table-success">
                          <tr>
                            <th>Month</th>
                            <th>Principal Paid</th>
                            <th>Interest Charged</th>
                            <th>Total Payment</th>
                            <th>Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {schedule[year].map((entry, idx) => (
                            <tr key={idx}>
                              <td>{entry.month}</td>
                              <td>{formatINR(entry.principalPaid)}</td>
                              <td>{formatINR(entry.interest)}</td>
                              <td>{formatINR(entry.emi)}</td>
                              <td>{formatINR(entry.balance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card.Body>
                )}
              </Card>
            ))}

            {years.length > 4 && (
              <div className="text-center mt-3">
                <Button variant="outline-success" onClick={handleToggleMore}>
                  {visibleYears < years.length ? "Show More" : "Show Less"}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </Container>
  );
};

export default EMIApp;

