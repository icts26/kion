document.addEventListener('DOMContentLoaded', () => {
    const csvFilePath = 'data4.csv'; // 気温CSVファイルの名前

    // Google Charts をロードする
    google.charts.load('current', {'packages':['corechart']});
    // Google Charts のロードが完了したら drawChart 関数を呼び出す
    google.charts.setOnLoadCallback(fetchAndDrawChart);

    function fetchAndDrawChart() {
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

    /**
     * CSVテキストをJavaScriptオブジェクトの配列に変換する関数
     * (前回のものと同じでOKですが、念のため再掲)
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
                const valueString = (values[index] || '').trim();

                if (header === 'Date') {
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
     * @param {Array<Object>} data - パースされたCSVデータ
     */
    function drawGoogleChart(data) {
        // Google Charts の DataTable 形式にデータを変換
        const googleChartData = new google.visualization.DataTable();
        
        // 列の追加: 1列目は日付、2列目は数値
        googleChartData.addColumn('date', '日付'); // Google Charts は日付型をサポート
        googleChartData.addColumn('number', '平均気温 (°C)');

        // 行の追加
        data.forEach(row => {
            // 日付文字列を Date オブジェクトに変換
            const dateObj = new Date(row.Date); 
            // ★追加: 日付オブジェクトが有効か確認するログ★
            if (isNaN(dateObj.getTime())) { // 無効なDateオブジェクトの場合
                console.error('無効な日付オブジェクトが生成されました:', row.Date);
                return; // この行はスキップ
            }
            // y軸の値がundefinedの場合はスキップするか、適切な値を設定
            if (row.AvgTemperature !== undefined) {
                googleChartData.addRow([dateObj, row.AvgTemperature]);
            } else {
                console.warn('AvgTemperature が undefined の行をスキップしました:', row);
            }
        });

        // グラフのオプション設定
        const options = {
            title: '過去の平均気温推移',
            curveType: 'function', // 滑らかな曲線にする
            legend: { position: 'bottom' },
            hAxis: { // 横軸（日付軸）の設定
                title: '日付',
                format: 'yyyy/MM/dd' // 日付の表示形式
            },
            vAxis: { // 縦軸（数値軸）の設定
                title: '平均気温 (°C)',
                minValue: 0 // 必要であれば最小値を設定
            }
        };

        // グラフを描画する div 要素を取得
        const chartDiv = document.getElementById('curve_chart');
        if (!chartDiv) {
            console.error("グラフを描画する 'curve_chart' 要素が見つかりません。");
            return;
        }

        // 折れ線グラフ（LineChart）を作成し、描画
        const chart = new google.visualization.LineChart(chartDiv);
        chart.draw(googleChartData, options);
    }
});
