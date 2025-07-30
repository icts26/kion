document.addEventListener('DOMContentLoaded', () => {
  const csvFilePath = 'data2.csv';

  fetch(csvFilePath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(csvText => {
      const data = parseCSV(csvText);
      console.log('Parsed Temperature Data (from parseCSV):', data);
      drawGoogleChart(data);
    })
    .catch(error => {
      console.error('CSVファイルの読み込みまたは解析中にエラーが発生しました:', error);
      alert('CSVファイルの読み込みに失敗しました。コンソールを確認してください。');
    });

  function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const row = {};
      headers.forEach((header, index) => {
        const valueString = (values[index] ?? '').trim();
        if (header === 'date') {
          row[header] = valueString;
        } else if (header === 'AvgTemperature') {
          const numValue = parseFloat(valueString);
          row[header] = isNaN(numValue) ? undefined : numValue;
        } else {
          row[header] = valueString;
        }
      });
      return row;
    });
  }

  function drawGoogleChart(dataArray) {
    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn('date', '日付');
    dataTable.addColumn('number', '平均気温');

    dataArray.forEach(row => {
      if (!row.Date || !row.AvgTemperature) {
        console.warn('不完全なデータ行をスキップ:', row);
        return;
      }

      const dateParts = row.Date.split('-');
      if (dateParts.length !== 3) {
        console.error('日付形式が不正です:', row.Date);
        return;
      }

      const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      if (isNaN(dateObj.getTime())) {
        console.error('無効な日付オブジェクトが生成されました:', row.Date);
        return;
      }

      dataTable.addRow([dateObj, row.AvgTemperature]);
    });

    const options = {
      title: '過去の平均気温推移',
      hAxis: { title: '日付', format: 'yyyy-MM-dd' },
      vAxis: { title: '平均気温 (°C)' },
      legend: 'none'
    };

    const chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(dataTable, options);
  }
});
