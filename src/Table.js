import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form, Table as BootstrapTable, Container, InputGroup } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const API_URL = process.env.REACT_APP_API_URL;

const Table = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [stockModalIsOpen, setStockModalIsOpen] = useState(false);
  const [currentStock, setCurrentStock] = useState(null);
  const [additionalStock, setAdditionalStock] = useState(0);
  const [currentMethod, setCurrentMethod] = useState(null);
  const [uid, setUid] = useState(0);
  const [currentUrl, setCurrentUrl] = useState(API_URL);
  const [currentDate, setCurrentDate] = useState("");
  const [availableStock, setAvailableStock] = useState(0);
  const [sizeCount, setSizeCount] = useState({});
  const [totalStockCash, setTotalStockCash] = useState(0);
  const [rateModalIsOpen, setRateModalIsOpen] = useState(false);
  const [newPrice, setNewPrice] = useState(0);
  const [newStock, setNewStock] = useState({
    uid: uid,
    brandName: '',
    size: '',
    stock: 0,
    price: 0,
    sales: 0,
    remainingStock: 0,
    date: currentDate,
  });

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
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const activeRes = await axios.get(`${currentUrl}/api/get-active-data`);
      let date = activeRes.data.date;
      setCurrentDate(date);
      const response = await axios.get(`${currentUrl}/api/get-stock/${date}`);
      setStocks(response.data);
      setUid(response.data[0].uid);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStockOpenModal = (stock, val) => {
    setCurrentStock(stock);
    setStockModalIsOpen(true);
    setCurrentMethod(val);
  };

  const handleStockCloseModal = () => {
    setStockModalIsOpen(false);
    setCurrentStock(null);
    setCurrentMethod(null);
    setAdditionalStock(0);
  };

  const handleRateOpenModal = (stock) => {
    setCurrentStock(stock);
    setRateModalIsOpen(true);
  };

  const handleRateCloseModal = () => {
    setRateModalIsOpen(false);
    setCurrentStock(null);
    setNewPrice(0);
    
  };

  const handleChangeinput = (e) => {
    setAdditionalStock(Number(e.target.value));
  };

  const handlePriceInput = (e) => {
    setNewPrice(e.target.value);
  }

  const handleOpenModal = () => {
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewStock({
      ...newStock,
      [name]: value,
    });
  };

  const handleCloseDay = async () => {
    try {
      await axios.post(`${currentUrl}/api/close-day-stock`, { uid });
      fetchStocks();
      toast.success("Successfully Closed!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdditionalStockSubmit = async (e) => {
    e.preventDefault();
    if (currentStock) {
      try {
        if (currentMethod === 'sales' && additionalStock > currentStock.remainingStock) {
          handleStockCloseModal();
          return;
        }
        const response = await axios.post(`${currentUrl}/api/update-stock`, {
          id: currentStock._id,
          variable: currentMethod,
          additionalStock,
        });
        setStocks(stocks.map(stock => stock._id === currentStock._id ? response.data : stock));
        handleStockCloseModal();
        toast.success("Successfully Updated!");
      } catch (error) {
        console.error('Error updating stock:', error);
      }
    }
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    if (currentStock) {
      try {
        const response = await axios.post(`${currentUrl}/api/update-price`, {
          id: currentStock._id,
          newPrice,
        });
        setStocks(stocks.map(stock => stock._id === currentStock._id ? response.data : stock));
        handleRateCloseModal();
        toast.success("Successfully Updated!");
      } catch (error) {
        console.error('Error updating stock:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await axios.post(`${currentUrl}/api/add-stock`, {
      uid: uid,
      brandName: newStock.brandName,
      size: newStock.size,
      stock: newStock.stock,
      sales: newStock.sales,
      price: newStock.price,
      date: currentDate,
    });
    setStocks([...stocks, response.data]);
    handleCloseModal();
    toast.success("Successfully Added!");
    setNewStock({
      uid: uid,
      brandName: '',
      size: '',
      stock: 0,
      price: 0,
      sales: 0,
      remainingStock: 0,
      date: currentDate,
    });
  };

  const handleAvailableStock = async(e, stock_id, stock) =>{
    e.preventDefault();
    if (availableStock <= stock && availableStock > 0) {
        try {
          const response = await axios.post(currentUrl + '/api/update-available-stock', {
            id: stock_id,
            availableStock 
          });
          setStocks(stocks.map(stock => stock._id === stock_id ? response.data : stock));
          toast.success("Successfully Updated !");
          e.target.reset();
        } catch (error) {
          console.error('Error updating stock:', error);
        }
      }
      else {
        toast.error(" Invalid Value");
      }


}

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
    <Container>
      <ToastContainer />
      <h1 className="text-center my-4">Stock Management</h1>
      <div className="d-flex justify-content-between mb-4 flex-wrap">
        <Button variant="info" size="sm" onClick={() => navigate('/history')}>
          History
        </Button>
        <Button variant="primary" size="sm" onClick={() => {}}>
          Add New
        </Button>
        <div className="d-flex gap-2">
          <Button variant="success" size="sm" onClick={exportToExcel}>
            Export to Excel
          </Button>
          <Button variant="danger" size="sm" onClick={exportToPDF}>
            Export to PDF
          </Button>
        </div>  
        <Button variant="info">{new Date(currentDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}</Button>
      </div>
      <div>
      <BootstrapTable striped bordered hover>
      <thead>
        <tr>
          <th colSpan="10" className="text-end fw-bold">Date :</th>
          <th>
            <b>
              {new Date(currentDate).toLocaleDateString('en-GB', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </b>
          </th>
        </tr>
      </thead>

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
              <td>
                <div className="d-flex justify-content-end align-items-center">
                  <span className="me-4">
                    {stock.new_stock.reduce((acc, num) => acc + num, 0)}
                  </span>
                  
                  <Button className="me-4" variant="secondary" size="sm" onClick={() => handleStockOpenModal(stock, 'stock')}>
                    Add Stock
                  </Button>
                </div>
              </td>
              <td>{stock.stock}</td>
              <td>
                <Form onSubmit={(e) => handleAvailableStock(e, stock._id, stock.stock)}>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      onChange={(e) => setAvailableStock(e.target.value)}
                       style={{ width: '40px' }}
                      required
                      className="form-control-sm"
                    />
                    <Form.Control.Feedback type="invalid">
                      {"errors"}
                    </Form.Control.Feedback>
                    <Button 
                      variant="secondary" 
                      type="submit" 
                      className="btn-sm" 
                    >
                      Add
                    </Button>
                  </InputGroup>
                </Form>
              </td>

              <td>{stock.sales}</td>
              <td>
                <div className="d-flex justify-content-end align-items-center">
                <span className="me-4">
                {stock.price}
                </span>
              <Button className="me-4" variant="info" size="sm" onClick={() => handleRateOpenModal(stock)}>
                    New Price
                  </Button>
                  </div>
              </td>
              <td>{stock.remainingStock}</td>
              <td>{stock.sales * stock.price}</td>
            </tr>
          )})}
         {stocks.length > 0 && (
            <tr>
              <td colSpan="10" className="text-end fw-bold">Total</td>
              <td>{totalStockCash}</td>
            </tr>
          )}
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
      </BootstrapTable>
      <div className="d-flex justify-content-end gap-3 me-8">
        <button onClick={handleCloseDay} className="danger-button btn btn-danger">Close Today Sales</button>
      </div>
      <div></div>
    </div>

      {/* Add New Stock Modal */}
      <Modal show={modalIsOpen} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="brandName">
              <Form.Label>Brand Name</Form.Label>
              <Form.Control 
                type="text" 
                name="brandName" 
                value={newStock.brandName} 
                onChange={handleChange} 
                required 
                placeholder="Enter brand name" 
              />
            </Form.Group>

            <Form.Group controlId="size" className="mt-3">
              <Form.Label>Size</Form.Label>
              <Form.Control as="select" name="size" onChange={handleChange} required>
                <option value="">Select Size</option>
                <option value="Q">Q (750 ml)</option>
                <option value="P">P (375 ml)</option>
                <option value="F">F (1000 ml)</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="stock" className="mt-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control 
                type="number" 
                name="stock" 
                value={newStock.stock} 
                onChange={handleChange} 
                required 
                placeholder="Enter stock quantity" 
              />
            </Form.Group>

            <Form.Group controlId="price" className="mt-3">
              <Form.Label>Price</Form.Label>
              <Form.Control 
                type="number" 
                name="price" 
                value={newStock.price} 
                onChange={handleChange} 
                required 
                placeholder="Enter price" 
              />
            </Form.Group>

            {/* Button Section */}
            <div className="mt-4 d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
              <Button variant="primary" type="submit">Add Stock</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>


      {/* Additional Stock Modal */}
      <Modal show={stockModalIsOpen} onHide={handleStockCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Additional {currentMethod === 'stock' ? 'Stock' : 'Sales'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAdditionalStockSubmit}>
            <Form.Group controlId="brandName">
              <Form.Label>Brand Name</Form.Label>
              <Form.Control type="text" value={currentStock?.brandName} disabled />
            </Form.Group>
            <Form.Group controlId="currentMethod">
              <Form.Label>Current {currentMethod === 'stock' ? 'Stock' : 'Sales'}</Form.Label>
              <Form.Control type="text" value={currentStock ? (currentMethod === 'stock' ? currentStock.stock : currentStock.sales) : ''} disabled />
            </Form.Group>
            <Form.Group controlId="additionalStock">
              <Form.Label>Additional {currentMethod === 'stock' ? 'Stock' : 'Sales'}</Form.Label>
              <Form.Control type="number" onChange={handleChangeinput} required />
            </Form.Group>
            <div className="mt-4 d-flex justify-content-end gap-2">
              <Button variant="primary" type="submit">Add</Button>
              <Button variant="secondary" onClick={handleStockCloseModal}>Cancel</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Rate Modal */}
      <Modal show={rateModalIsOpen} onHide={handleRateCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Price Change</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRateSubmit}>
            <Form.Group controlId="brandName">
              <Form.Label>Brand Name</Form.Label>
              <Form.Control type="text" value={currentStock?.brandName} disabled />
            </Form.Group>
            <Form.Group controlId="currentMethod">
              <Form.Label>Current Price</Form.Label>
              <Form.Control type="text" value={currentStock?.price} disabled />
            </Form.Group>
            <Form.Group controlId="additionalStock">
              <Form.Label> New Price</Form.Label>
              <Form.Control type="number" onChange={handlePriceInput} required />
            </Form.Group>
            <div className="mt-4 d-flex justify-content-end gap-2">
              <Button variant="primary" type="submit">Add</Button>
              <Button variant="secondary" onClick={handleRateCloseModal}>Cancel</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Table;
