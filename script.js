// Google Charts のロードはグローバルスコープで行う
google.charts.load('current', { packages: ['corechart'] });
// Google Charts のロードが完了したら drawChart 関数を呼び出す
google.charts.setOnLoadCallback(fetchAndDrawChart);

function fetchAndDrawChart() {
  const csvFilePath = 'data3.csv'; // CSVファイルの名前

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
 * (変更なし)
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
/**
<<<<<<< HEAD
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
=======
/*
/**
 * Google Charts を使ってグラフを描画する関数
 * @param {Array<Object>} allData - パースされた全CSVデータ
 */
function drawGoogleChart(allData) {
    const dataTable = new google.visualization.DataTable();

    // グラフに含める年を特定
    // allDataの最初のデータから、最小の年と最大の年を特定する
    let minYear = Infinity;
    let maxYear = -Infinity;
    allData.forEach(row => {
        const year = parseInt(row.date.substring(0, 4));
        if (year < minYear) minYear = year;
        if (year > maxYear) maxYear = year;
    });

    // Google Charts の DataTable の列を設定
    dataTable.addColumn('date', '日付'); // 1列目は常に日付
    const years = [];
    for (let year = minYear; year <= maxYear; year++) {
        years.push(year);
        dataTable.addColumn('number', `${year}年 平均気温`); // 年ごとの列を追加
    }

    // データを行に整形
    // Google Charts の「日付」列は、日付（年を除く月日）と考える
    // 例: 2022-01-01 と 2023-01-01 は、軸上では同じ1月1日の位置に来る
    const monthlyDailyData = {}; // 'MM-DD' をキーとするオブジェクト

    allData.forEach(row => {
        const year = parseInt(row.date.substring(0, 4));
        const monthDay = row.date.substring(5); // 'MM-DD' 部分 (例: '01-01')

        if (!monthlyDailyData[monthDay]) {
            // 各日付（月日）ごとに、全年のデータを入れる配列を初期化
            // 配列の最初の要素は「日付オブジェクト」（年を除く月日）
            // その後の要素は各年の気温データ（対応する年がなければ null）
            const dayOfMonth = parseInt(monthDay.substring(3, 5));
            const month = parseInt(monthDay.substring(0, 2)) - 1; // 月は0始まり

            // 例: Date(2000, 0, 1) - 年はダミー（うるう年を考慮して4で割り切れる年にすると良い）
            // Google Charts の日付軸は、年の部分を無視して月日をプロットしてくれるため
            monthlyDailyData[monthDay] = [new Date(2000, month, dayOfMonth)]; 
            
            // 各年の列の初期値を null で埋める
            for (let i = 0; i < years.length; i++) {
                monthlyDailyData[monthDay].push(null);
            }
        }

        // 該当する年の列に気温データを設定
        const yearIndex = years.indexOf(year);
        if (yearIndex !== -1) {
            if (row.AvgTemperature !== undefined && !isNaN(row.AvgTemperature)) {
                 // date列の次からがyears[0]のデータなので、+1する
                monthlyDailyData[monthDay][yearIndex + 1] = row.AvgTemperature;
            }
        }
    });

    // monthlyDailyData のキー（MM-DD）をソートして、日付順に DataTable に追加
    Object.keys(monthlyDailyData).sort().forEach(monthDay => {
        dataTable.addRow(monthlyDailyData[monthDay]);
    });
    
    // データテーブルが空でないか確認
    if (dataTable.getNumberOfRows() === 0) {
        console.warn("Google Charts の DataTable にデータ行がありません。グラフは表示されません。");
        return;
    }

    // グラフのオプション設定
    const options = {
        title: '過去の平均気温推移（年別比較）',
        curveType: 'function',
        legend: { position: 'bottom' },
        hAxis: {
            title: '日付',
            format: 'MMM d' // 月日だけを表示
        },
        vAxis: {
            title: '平均気温 (°C)',
            minValue: 0
        },
        explorer: {
            actions: ['dragToZoom', 'rightClickToReset'],
            axis: 'horizontal',
            keepInBounds: true,
            maxZoomIn: 0.1
        },
        // 各系列（年）の色をここで設定
        series: {
            // 0: { color: '#e2431e' }, // 2021年 (最初の年)
            // 1: { color: '#629e51' }, // 2022年
            // 2: { color: '#007bff' }, // 2023年
            // 3: { color: '#ffc107' }  // 2024年
            // 色はデフォルトでも自動で割り当てられますが、明示的に指定する場合はコメントを外してください
            // years配列のインデックスに対応します
        }
    };

    const chartDiv = document.getElementById('chart_div');
    if (!chartDiv) {
        console.error("グラフを描画する 'chart_div' 要素が見つかりません。");
        return;
    }
    
    const chart = new google.visualization.LineChart(chartDiv);
    chart.draw(dataTable, options);
}