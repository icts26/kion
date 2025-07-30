// Google Charts のロードはグローバルスコープで行う
google.charts.load('current', { packages: ['corechart'] });
// Google Charts のロードが完了したら drawChart 関数を呼び出す
google.charts.setOnLoadCallback(fetchAndDrawChart); // fetchAndDrawChart が定義済みである必要がある

// fetchAndDrawChart 関数をグローバルスコープ、
// もしくは DOMContentLoaded イベントリスナーの外に定義
// 
function fetchAndDrawChart() {
  const csvFilePath = 'data2.csv'; // CSVファイルの名前

  fetch(csvFilePath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(csvText => {
      const data = parseCSV(csvText);
      console.log('Parsed Temperature Data (from parseCSV):', data); // デバッグ用
      drawGoogleChart(data);
    })
    .catch(error => {
      console.error('CSVファイルの読み込みまたは解析中にエラーが発生しました:', error);
      alert('CSVファイルの読み込みに失敗しました。コンソールを確認してください。');
    });
}
document.addEventListener('DOMContentLoaded', () => {
  // DOMContentLoaded 内には、グローバルスコープで定義された関数を呼び出すだけ
  // または、DOM要素にアクセスする処理のみを記述
});

/**
 * CSVテキストをJavaScriptオブジェクトの配列に変換する関数
 * @param {string} csvText - CSVファイルの文字列
 * @returns {Array<Object>} - パースされたデータの配列
 */
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const row = {};
    headers.forEach((header, index) => {
      const valueString = (values[index] ?? '').trim();
      if (header === 'date') { // ここは既に 'date' (小文字) でOK
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

/**
 * Google Charts を使ってグラフを描画する関数
 * @param {Array<Object>} dataArray - パースされたCSVデータ
 */
function drawGoogleChart(dataArray) {
  const dataTable = new google.visualization.DataTable();
  dataTable.addColumn('date', '日付');
  dataTable.addColumn('number', '平均気温');

  dataArray.forEach(row => {
    // ★ここを修正: row.Date を row.date に変更★
    if (!row.date || row.AvgTemperature === undefined || isNaN(row.AvgTemperature)) { // AvgTemperature の NaN も考慮
      console.warn('不完全なデータ行をスキップ:', row);
      return;
    }

    const dateParts = row.date.split('-'); // ★ここを修正: row.Date を row.date に変更★
    if (dateParts.length !== 3) {
      console.error('日付形式が不正です:', row.date); // ログも修正
      return;
    }

    // Date オブジェクトのコンストラクタは月が0-indexedであることに注意
    const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    
    if (isNaN(dateObj.getTime())) {
      console.error('無効な日付オブジェクトが生成されました:', row.date); // ログも修正
      return;
    }

    dataTable.addRow([dateObj, row.AvgTemperature]);
  });
  
  // ★追加: データテーブルが空でないか確認★
  if (dataTable.getNumberOfRows() === 0) {
      console.warn("Google Charts の DataTable にデータ行がありません。グラフは表示されません。");
      return;
  }

  const options = {
    title: '過去の平均気温推移',
    hAxis: { title: '日付', format: 'yyyy/MM/dd' },
    vAxis: { title: '平均気温', minValue: 0 },
    legend: { position: 'bottom' },
    curveType: 'function',
    explorer: {
        actions: ['dragToZoom', 'rightClickToReset'],
        axis: 'horizontal',
        keepInBounds: true,
        maxZoomIn: 0.1
    }
  };

  // HTML要素のIDが chart_div に変更されているため修正
  const chartDiv = document.getElementById('chart_div'); // ★ここを修正: 'curve_chart' から 'chart_div' に★
  if (!chartDiv) {
      console.error("グラフを描画する 'chart_div' 要素が見つかりません。");
      return;
  }
  
  const chart = new google.visualization.LineChart(chartDiv);
  chart.draw(dataTable, options);
}

