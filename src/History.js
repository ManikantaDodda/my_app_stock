import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [currentUrl, setCurrentUrl] = useState("https://stock-management-backend-iii5.onrender.com");
  const [currentDate, setCurrentDate] = useState(null);

 const handleSearchInput = (e) =>{
  setCurrentDate(e.target.value);
 }

  const fetchStocks = async (e) => {
    e.preventDefault();
    try {
      if(currentDate)
        {
        const response = await axios.get(currentUrl + '/api/get-stock/'+currentDate );
        setStocks(response.data); 
        }
    } catch (error) {
        
    }
    
  };
  


  let totalAll = 0;
  return (
    <div className="App">
      <h1>History</h1>
      <form onSubmit={fetchStocks} className="search-form">
        <div className='button-container'>
        <input
          type="date"
          name="search"
          className="search-input"
          onChange={handleSearchInput}
          required
        />
        <button type="submit" className="search-button">Search</button>
        </div>
      </form>
      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Brand Name</th>
            <th>Stock</th>
            <th>Price</th>
            <th>Sales</th>
            <th>Total Price</th>
            <th>Remaining Stock</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock, index) => {
            totalAll += stock.sales * stock.price;
            return(
            <tr key={stock._id}>
              <td>{index + 1}</td>
              <td>{stock.brandName}</td>
              <td>{stock.stock} </td>           
              <td>{stock.price}</td>
              <td>{stock.sales}</td>
              <td>{stock.sales * stock.price}</td>
              <td>{stock.remainingStock}</td>
              <td>{new Date(stock.date).toLocaleDateString()}</td>
            </tr>
            );})}
            {stocks.length > 0 ?<><th></th><th></th><th></th><th></th><th></th><th>{totalAll}</th><th></th></>:""}
        </tbody>
      </table>
      <div className="button-container">
                <button onClick={()=>navigate('/')} className="danger-button">Back</button> 
      </div>
    </div>
  );
};

export default History;

