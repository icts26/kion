document.addEventListener('DOMContentLoaded', () => {
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
            console.log('Parsed Temperature Data:', data); // デバッグ用

            renderTemperatureChart(data);
        })
        .catch(error => {
            console.error('CSVファイルの読み込みまたは解析中にエラーが発生しました:', error);
            alert('CSVファイルの読み込みに失敗しました。コンソールを確認してください。');
        });

    /**
     * CSVテキストをJavaScriptオブジェクトの配列に変換する関数
     * @param {string} csvText - CSVファイルの文字列
     * @returns {Array<Object>} - パースされたデータの配列
     */
    function parseCSV(csvText) {
        const lines = csvText.trim().split('\n'); // 各行に分割
        const headers = lines[0].split(','); // ヘッダー行を分割

        return lines.slice(1).map(line => {
            const values = line.split(',');
            const row = {};
            headers.forEach((header, index) => {
                // 日付は文字列として保持し、気温は数値に変換
                if (header.trim() === 'Date') {
                    row[header.trim()] = values[index].trim();
                } else {
                    row[header.trim()] = isNaN(Number(values[index])) ? values[index].trim() : Number(values[index]);
                }
            });
            return row;
        });
    }

    /**
     * Chart.jsを使って気温グラフを描画する関数
     * @param {Array<Object>} data - パースされたCSVデータ
     */
    function renderTemperatureChart(data) {
        // Chart.jsのデータ形式に変換
        // x軸が日付、y軸が気温となるようにオブジェクトの配列を作る
        console.log('Parsed Temperature Data:', data); //　引数の確認
        
        const chartData = data.map(row => ({
            x: row.Date, // 日付
            y: row.AvgTemperature // 平均気温
        }));
        console.log('Chart Data to be rendered:', chartData); // ★この行を追加★

        const ctx = document.getElementById('temperatureChart').getContext('2d');
        new Chart(ctx, {
            type: 'line', // 折れ線グラフ
            data: {
                datasets: [{
                    label: '平均気温 (°C)',
                    data: chartData,
                    borderColor: 'rgba(255, 99, 132, 1)', // 線の色
                    backgroundColor: 'rgba(255, 99, 132, 0.2)', // 塗りつぶしの色
                    fill: false, // グラフの下を塗りつぶさない
                    tension: 0.1 // 線の滑らかさ
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time', // X軸のタイプを'time'に設定
                        time: {
                            // ★ここを修正/追加★ - CSVの日付形式に合わせて 'YYYY-MM-DD' を指定
                            parser: 'YYYY-MM-DD', // CSVファイルの日付形式がこれであることを前提
                            unit: 'day', // 単位を日とする
                            tooltipFormat: 'YYYY/MM/DD', // ツールチップの日付表示形式
                            displayFormats: {
                                day: 'MMM D' // 軸ラベルの日付表示形式 (例: Jan 1)
                            }
                        },
                        title: {
                            display: true,
                            text: '日付'
                        }
                    },
                    y: {
                        beginAtZero: false, // 0から始める必要がなければfalse
                        title: {
                            display: true,
                            text: '平均気温 (°C)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '過去の平均気温推移'
                    }
                }
            }
        });
    }
});
