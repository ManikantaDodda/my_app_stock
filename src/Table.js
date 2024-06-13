import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactModal from 'react-modal';

const Table = () => {
  const [stocks, setStocks] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [stockModalIsOpen, setStockModalIsOpen] = useState(false);
  const [currentStock, setCurrentStock] = useState(null);
  const [additionalStock, setAdditionalStock] = useState(0);
  const [currentMethod, setCurrentMethod] = useState(null);
  const [uid, setUid] = useState(0);
  const [currentUrl, setCurrentUrl] = useState("https://stock-management-backend-iii5.onrender.com");
  const [currentDate, setCurrentDate] = useState("");
  const [newStock, setNewStock] = useState({
    uid : 0,
    brandName: '',
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
    setNewStock({
      ...newStock,
      [name]: value,
    });
  };
  const handleCloseDay = async () => {
    try {
        const response = await axios.post(currentUrl + '/api/close-day-stock', {uid} );  
        fetchStocks();
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
        } catch (error) {
          console.error('Error updating stock:', error);
        }
      }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await axios.post(currentUrl + '/api/add-stock', {
      brandName: newStock.brandName,
      stock: newStock.stock,
      sales: newStock.sales,
      price: newStock.price,
      date: currentDate
    });
    setStocks([...stocks, response.data]);
    handleCloseModal();
  };

  return (
    <div className="App">
      <h1>Stock Management</h1>
      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Brand Name</th>
            <th>Stock</th>
            <th>Price</th>
            <th>Sales</th>
            <th>Remaining Stock</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock, index) => (
            <tr key={stock._id}>
              <td>{index + 1}</td>
              <td>{stock.brandName}</td>
              <td>{stock.stock} <button onClick={() => handleStockOpenModal(stock,'stock')}>Add Stock</button></td>           
              <td>{stock.price}</td>
              <td>{stock.sales} <button onClick={() => handleStockOpenModal(stock, 'sales')}>Add Sales</button></td>
              <td>{stock.remainingStock}</td>
              <td>{new Date(stock.date).toLocaleDateString()}</td>
            </tr>
          ))}
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
      <button onClick={handleOpenModal} className="add-new-button">Add New</button> 
      <button onClick={handleCloseDay} className="danger-button">Close</button>
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
          <label>Sales</label>
          <input
            type="number"
            name="sales"
            value={newStock.sales}
            onChange={handleChange}
            required
          />
          <label>Remaining Stock</label>
          <input
            type="number"
            name="remainingStock"
            value={newStock.remainingStock}
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
