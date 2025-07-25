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
        const chartData = data.map(row => {
        // Day.jsを使って日付文字列を明示的に解析
        // 'YYYY-MM-DD' はCSVファイルの日付形式に合わせてください
        const parsedDate = dayjs(row.x, 'YYYY-MM-DD'); 

        // 解析が成功したかを確認（デバッグ用）
        if (!parsedDate.isValid()) {
            console.error('無効な日付データが見つかりました:', row.x);
            // 無効なデータはスキップするか、適切なデフォルト値を設定
            return null; // この行はグラフに含めない
        }
        return {
            x: parsedDate.valueOf(), // Day.jsオブジェクトからミリ秒単位のタイムスタンプを取得
            y: row.y
        };
    }).filter(item => item !== null); // 無効な日付があった行をフィルタリングして除外

    console.log('Chart Data to be rendered (after explicit parsing):', chartData); // 最終確認用

    const ctx = document.getElementById('temperatureChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: '平均気温 (°C)',
                data: chartData,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        tooltipFormat: 'YYYY/MM/DD',
                        displayFormats: {
                            day: 'MMM D'
                        }
                    },
                    title: {
                        display: true,
                        text: '日付'
                    }
                },
                y: {
                    beginAtZero: false,
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
