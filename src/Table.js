import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactModal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Table = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [stockModalIsOpen, setStockModalIsOpen] = useState(false);
  const [currentStock, setCurrentStock] = useState(null);
  const [additionalStock, setAdditionalStock] = useState(0);
  const [currentMethod, setCurrentMethod] = useState(null);
  const [uid, setUid] = useState(0);
  const [currentUrl, setCurrentUrl] = useState("http://localhost:5000");
  const [currentDate, setCurrentDate] = useState("");
  const [availableStock, setAvailableStock] = useState(0);
  const [sizeCount, setSizeCount] = useState({});
  const [newStock, setNewStock] = useState({
    uid : uid,
    brandName: '',
    size : '',
    stock: 0,
    price: 0,
    sales: 0,
    remainingStock: 0,
    date: currentDate,
  });

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
        const activeRes = await axios.get(currentUrl + '/api/get-active-data' );
        let date = activeRes.data.date;
        setCurrentDate(date);
        const response = await axios.get(currentUrl + '/api/get-stock/'+date );
        setStocks(response.data); 
        setUid(response.data[0].uid);  
    } catch (error) {
        
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

  const handleChangeinput = (e) => {
    setAdditionalStock(Number(e.target.value));
  };

  const handleOpenModal = () => {
    setModalIsOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalIsOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(newStock);
    setNewStock({
      ...newStock,
      [name]: value,
    });
  };
  const handleCloseDay = async () => {
    try {
        const response = await axios.post(currentUrl + '/api/close-day-stock', {uid} );  
        fetchStocks();
        toast.success("Successfully Closed !");
    } catch (error) {
        
    }
  }
  const handleAdditionalStockSubmit =  async (e) => {
    e.preventDefault();
    if (currentStock) {
        try {
          if(currentMethod == 'sales' && additionalStock > currentStock.remainingStock)
          {
            handleStockCloseModal();
            return;
          }
          const response = await axios.post(currentUrl + '/api/update-stock', {
            id: currentStock._id,
            variable : currentMethod,
            additionalStock 
          });
          setStocks(stocks.map(stock => stock._id === currentStock._id ? response.data : stock));
          handleStockCloseModal();
          toast.success("Successfully Updated !");
        } catch (error) {
          console.error('Error updating stock:', error);
        }
      }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await axios.post(currentUrl + '/api/add-stock', {
      uid : uid,
      brandName: newStock.brandName,
      size : newStock.size,
      stock: newStock.stock,
      sales: newStock.sales,
      price: newStock.price,
      date: currentDate
    });
    setStocks([...stocks, response.data]);
    handleCloseModal();
    toast.success("Successfully Added !");
    setNewStock({
      uid : uid,
      brandName: '',
      size : '',
      stock: 0,
      price: 0,
      sales: 0,
      remainingStock: 0,
      date: currentDate})
  };
  let totalAll = 0;
  const handleAvailableStock = async(e, stock_id) =>{
      e.preventDefault();
      if (availableStock) {
          try {
            const response = await axios.post(currentUrl + '/api/update-available-stock', {
              id: stock_id,
              availableStock 
            });
            setStocks(stocks.map(stock => stock._id === stock_id ? response.data : stock));
            toast.success("Successfully Updated !");
          } catch (error) {
            console.error('Error updating stock:', error);
          }
        }

  }
  useEffect(()=>{
    const counts = stocks.reduce((acc, item) => {
      // Increment the count for the current size value, defaulting to 0 if not yet present
      acc[item.size] = (acc[item.size] || 0) + 1;
      return acc;
    }, {});
    setSizeCount(counts);
  }, [stocks])
  return (
    <div className="App">
      <ToastContainer />
      <h1>Stock Management</h1>
      <button type="button" onClick={()=> navigate('/history')}>History</button>
      
      <table>
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
            totalAll += stock.sales * stock.price;
            return(
            <tr key={stock._id}>
              <td>{index + 1}</td>
              <td>{stock.brandName}</td>
              <td>{stock.size}</td>
              <td>{stock.opening_balance}</td> 
              <td>{stock.new_stock.reduce((acc, num) => acc + num, 0)}<br></br><button onClick={() => handleStockOpenModal(stock,'stock')}>Add Stock</button></td>   
              <td>{stock.stock}</td>
              <td><form onSubmit={(e)=>handleAvailableStock(e, stock._id)}><input type="number" onChange={(e)=>setAvailableStock(e.target.value)} required/><button type='submit'>Add</button></form></td>
              <td>{stock.sales}</td>
              <td>{stock.price}</td>
              <td>{stock.remainingStock}</td>
              <td>{stock.sales * stock.price}</td>
            </tr>
            );})}
            {stocks.length > 0 ?<><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th>{totalAll}</th></>:""}
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
      </table>
      <ReactModal
                    isOpen={stockModalIsOpen}
                    onRequestClose={handleStockCloseModal}
                    contentLabel="Add New Stock"
                    className="modal"
                    overlayClassName="overlay"
                >
                    <h2>Add Additional Stock</h2>
                    <form onSubmit={handleAdditionalStockSubmit}>
                    <label>Brand Name</label>
                    <input
                        type="text"
                        name="brandName"
                        value={currentStock?.brandName}
                        disabled
                    />
                    <label>Current {currentMethod == 'stock' ? 'Stock' : "Sales" }</label>
                    <input
                        type="text"
                        name="brandName"
                        value={currentStock?.[currentMethod]}
                        disabled
                    />
                    <label>Additional {currentMethod == 'stock' ? 'Stock' : "Sales" }</label>
                    <input
                        type="number"
                        name="stock"
                        onChange={handleChangeinput}
                        required
                    />
                    <label style={{color : "red"}}>{currentMethod === 'sales' && additionalStock > currentStock.remainingStock ? "Sales Less Than Remaining Stock" : ""}</label>
                    <button type="submit"  disabled={currentMethod === 'sales' && additionalStock > currentStock.remainingStock}> Add Additional {currentMethod == 'stock' ? 'Stock' : "Sales" }</button>
                    <button type="button" onClick={handleStockCloseModal}>Cancel</button>
                    </form>
                </ReactModal>
              <div className="button-container">
                <button onClick={handleOpenModal} className="add-new-button">Add New</button> 
                <button onClick={handleCloseDay} className="danger-button">Close Today Sales</button>
            </div>
      <ReactModal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Add New Stock"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Add New Stock</h2>
        <form onSubmit={handleSubmit}>
          <label>Brand Name</label>
          <input
            type="text"
            name="brandName"
            value={newStock.brandName}
            onChange={handleChange}
            required
          />
          <label>Size</label>
          <select name="size" className= "select-input" onChange={handleChange}>
            <option value={""}>Select Size </option>
            <option value={"Q"}>Q (750 ml)</option>
            <option value={"P"}>P (375 ml)</option>
            <option value={"F"}>F (1000ml)</option>
          </select>
          <label>Stock</label>
          <input
            type="number"
            name="stock"
            value={newStock.stock}
            onChange={handleChange}
            required
          />
          <label>Price</label>
          <input
            type="number"
            name="price"
            value={newStock.price}
            onChange={handleChange}
            required
          />
  
          <button type="submit">Add Stock</button>
          <button type="button" onClick={handleCloseModal}>Cancel</button>
        </form>
      </ReactModal>

    </div>
  );
};

export default Table;
