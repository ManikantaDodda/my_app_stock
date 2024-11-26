import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Table } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const API_URL = process.env.REACT_APP_API_URL;
const History = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [currentUrl] = useState(API_URL);
  const [currentDate, setCurrentDate] = useState(null);
  const [sizeCount, setSizeCount] = useState({});
  const [totalStockCash, setTotalStockCash] = useState(0);

  const handleSearchInput = (e) => {
    setCurrentDate(e.target.value);
  };

  const fetchStocks = async (e) => {
    e.preventDefault();
    try {
      if (currentDate) {
        const response = await axios.get(`${currentUrl}/api/get-stock/${currentDate}`);
        setStocks(response.data);
        toast.success("Processed Successfully");
      }
    } catch (error) {
      toast.error("Failed to fetch data. Please try again.");
    }
  };
  const exportToExcel = () => {
    const formattedData = stocks.map((stock, index) => ({
      "S.No": index + 1,
      "Brand Name": stock.brandName,
      "Size": stock.size,
      "Opening Balance": stock.opening_balance,
      "Purchase": stock.new_stock.reduce((acc, num) => acc + num, 0),
      "Total": stock.stock,
      "Available Stock": stock.remainingStock,
      "Sales": stock.sales,
      "Rate": stock.price,
      "Closing Balance": stock.remainingStock,
      "Cash": stock.sales * stock.price,
    }));
  
    // Append totals row
    formattedData.push({
      "S.No": "",
      "Brand Name": "",
      "Size": "",
      "Opening Balance": "",
      "Purchase": "",
      "Total": "",
      "Available Stock": "",
      "Sales": "",
      "Rate": "",
      "Closing Balance": "Total Cash",
      "Cash": totalStockCash ,
    });
  
    // Append size counts row
    formattedData.push({
      "S.No": "",
      "Brand Name": "Size ",
      "Size": "Counts",
      "Opening Balance": "",
      "Purchase": "",
      "Total": "",
      "Available Stock": "",
      "Sales": "",
      "Rate": "",
      "Closing Balance": "",
      "Cash": "",
    });
    formattedData.push({
      "S.No": "",
      "Brand Name": " Q ",
      "Size": `${sizeCount.Q ? sizeCount.Q : 0 }`,
      "Opening Balance": "",
      "Purchase": "",
      "Total": "",
      "Available Stock": "",
      "Sales": "",
      "Rate": "",
      "Closing Balance": "",
      "Cash": "",
    });
    formattedData.push({
      "S.No": "",
      "Brand Name": " P ",
      "Size":`${sizeCount.P ? sizeCount.P : 0 }`,
      "Opening Balance": "",
      "Purchase": "",
      "Total": "",
      "Available Stock": "",
      "Sales": "",
      "Rate": "",
      "Closing Balance": "",
      "Cash": "",
    });
    formattedData.push({
      "S.No": "",
      "Brand Name": " F ",
      "Size": `${sizeCount.F ? sizeCount.F : 0 }`,
      "Opening Balance": "",
      "Purchase": "",
      "Total": "",
      "Available Stock": "",
      "Sales": "",
      "Rate": "",
      "Closing Balance": "",
      "Cash": "",
    });
  
    // Generate worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
  
    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stocks");
  
    // Write file
    const currData = new Date(currentDate).toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    XLSX.writeFile(workbook, `Stock_Data_${currData}.xlsx`);
  };
  

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "S.No",
      "Brand Name",
      "Size",
      "Opening Balance",
      "Purchase",
      "Total",
      "Available Stock",
      "Sales",
      "Rate",
      "Closing Balance",
      "Cash",
    ];
    const tableRows = stocks.map((stock, index) => [
      index + 1,
      stock.brandName,
      stock.size,
      stock.opening_balance,
      stock.new_stock.reduce((acc, num) => acc + num, 0),
      stock.stock,
      stock.remainingStock,
      stock.sales,
      stock.price,
      stock.remainingStock,
      stock.sales * stock.price,
    ]);


  // Add a totals row
  tableRows.push([
    "", // Empty S.No
    "", // Empty Brand Name
    "", // Empty Size
    "", // Empty Opening Balance
    "", // Empty Purchase
    "", // Empty Total
    "", // Empty Available Stock
    "", // Empty Sales
    "", // Empty Rate
    "Total Cash", // Label
    totalStockCash, // Total Cash Value
  ]);

   tableRows.push([
    "", 
    "Size",
    "Counts",
    "",
    "",
    "",
    "", 
    "",
    "",
    "",
    "",
    "",
  ]);

    tableRows.push([
      "", // Empty S.No
      `Q`,
      `${sizeCount.Q ? sizeCount.Q : 0 }`,
      "",
      "",
      "", 
      "",
      "",
      "",
      "",
      "",
    ]);
    tableRows.push([
      "", // Empty S.No
      `P`,
      `${sizeCount.P ? sizeCount.P : 0 }`,
      "",
      "",
      "", 
      "",
      "",
      "",
      "",
      "",
    ]);
    tableRows.push([
      "", // Empty S.No
      `F`,
      `${sizeCount.F ? sizeCount.F : 0 }`,
      "",
      "",
      "", 
      "",
      "",
      "",
      "",
      "",
    ]);


    doc.text("Stock Management Report", 14, 15);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    const currData = new Date(currentDate).toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    doc.save(`Stock_Report_${currData}.pdf`);
  };

  useEffect(() => {
    const counts = stocks.reduce((acc, item) => {
      acc[item.size] = (acc[item.size] || 0) + 1;
      return acc;
    }, {});
    const totalCash = stocks.reduce(
      (total, stock) => total + stock.sales * stock.price,
      0
    );
    setTotalStockCash(totalCash);
    setSizeCount(counts);
  }, [stocks]);

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h1 className="mb-4">History</h1>
      <form onSubmit={fetchStocks} className="mb-4">
        <div className="d-flex align-items-center gap-2">
          <input
            type="date"
            className="form-control"
            onChange={handleSearchInput}
            required
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </div>
      </form>

      {currentDate && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>
            Selected Date:{" "}
            {new Date(currentDate).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </h4>
          {stocks.length > 0 ? 
          <div className="d-flex gap-2">
            <Button variant="success" onClick={exportToExcel}>Export to Excel</Button>
            <Button variant="danger" onClick={exportToPDF}>Export to PDF</Button>
          </div> : ""}
        </div>
      )}

      {stocks.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Brand Name</th>
              <th>Size</th>
              <th>Opening Balance</th>
              <th>Purchase</th>
              <th>Total</th>
              <th>Available Stock</th>
              <th>Sales</th>
              <th>Rate</th>
              <th>Closing Balance</th>
              <th>Cash</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock, index) => {
              return (
                <tr key={stock._id}>
                  <td>{index + 1}</td>
                  <td>{stock.brandName}</td>
                  <td>{stock.size}</td>
                  <td>{stock.opening_balance}</td>
                  <td>{stock.new_stock.reduce((acc, num) => acc + num, 0)}</td>
                  <td>{stock.stock}</td>
                  <td>{stock.remainingStock}</td>
                  <td>{stock.sales}</td>
                  <td>{stock.price}</td>
                  <td>{stock.remainingStock}</td>
                  <td>{stock.sales * stock.price}</td>
                </tr>
              );
            })}
            <tr>
              <td colSpan="10" className="text-end fw-bold">Total Cash:</td>
              <td>{totalStockCash}</td>
            </tr>
            
          <tr>
              <th></th>
              <th>Size</th>
              <th>Counts</th>
            </tr>
            <tr>
              <td></td>
              <td>Q</td>
              <td>{sizeCount.Q ? sizeCount.Q : 0 }</td>
            </tr>
            <tr>
              <td></td>
              <td>P</td>
              <td>{sizeCount.P ? sizeCount.P : 0}</td>
            </tr>
            <tr>
              <td></td>
              <td>F</td>
              <td>{sizeCount.F ? sizeCount.F : 0}</td>
            </tr>
          </tbody>
        </Table>
      ) : (
        <p className="text-muted">No data available for the selected date.</p>
      )}

      <div className="mt-3">
        <button onClick={() => navigate('/')} className="btn btn-danger">Back</button>
      </div>
    </div>
  );
};

export default History;
