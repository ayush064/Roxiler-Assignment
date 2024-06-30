import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

const TransactionsBarChart = ({ month }) => {
  const [barChartData, setBarChartData] = useState({});

  useEffect(() => {
    fetchBarChartData();
  }, [month]);

  const fetchBarChartData = async () => {
    try {
      const response = await axios.get(`/api/bar_chart`, {
        params: { month },
      });
      const data = response.data;
      setBarChartData({
        labels: Object.keys(data),
        datasets: [{
          label: 'Number of Items',
          data: Object.values(data),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        }],
      });
    } catch (error) {
      console.error('Error fetching bar chart data:', error);
    }
  };

  return (
    <div>
      <Bar data={barChartData} />
    </div>
  );
};

export default TransactionsBarChart;
