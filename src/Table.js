import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactModal from 'react-modal';

const Table = () => {
  const [stocks, setStocks] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newStock, setNewStock] = useState({
    brandName: '',
    stock: 0,
    price: 0,
    sales: 0,
    remainingStock: 0,
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/get-stock/2024-06-13' );
        setStocks(response.data);   
    } catch (error) {
        
    }
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await axios.post('http://localhost:5000/api/add-stock', {
      brandName: newStock.brandName,
      stock: newStock.stock,
      sales: newStock.sales,
      price: newStock.price,
      date:newStock.date
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
              <td>{stock.stock} <button>Add Stock</button></td>
              <td>{stock.price}</td>
              <td>{stock.sales}</td>
              <td>{stock.remainingStock}</td>
              <td>{new Date(stock.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleOpenModal} className="add-new-button">Add New</button>
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
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={newStock.date}
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
