document.addEventListener('DOMContentLoaded', () => {
    const csvFilePath = 'data.csv'; // CSVファイルの名前

    fetch(csvFilePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(csvText => {
            // CSVテキストを解析する
            const data = parseCSV(csvText);
            console.log('Parsed CSV Data:', data); // デバッグ用

            // グラフ描画
            renderChart(data);
        })
        .catch(error => {
            console.error('CSVファイルの読み込みまたは解析中にエラーが発生しました:', error);
            alert('CSVファイルの読み込みに失敗しました。コンソールを確認してください。'+ csvFilePath);
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
                // 数値に変換できる場合は変換する
                row[header.trim()] = isNaN(Number(values[index])) ? values[index].trim() : Number(values[index]);
            });
            return row;
        });
    }

    /**
     * Chart.jsを使ってグラフを描画する関数
     * @param {Array<Object>} data - パースされたCSVデータ
     */
    function renderChart(data) {
        const labels = data.map(row => row.Month); // 月 (X軸)
        const sales = data.map(row => row.Sales);   // 売上 (Y軸)

        const ctx = document.getElementById('myChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar', // 棒グラフ
            data: {
                labels: labels,
                datasets: [{
                    label: '月別売上',
                    data: sales,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)', // 棒の色
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // コンテナに合わせてサイズ調整
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '売上'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '月'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '月別売上データ'
                    }
                }
            }
        });
    }
});
