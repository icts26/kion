document.addEventListener('DOMContentLoaded', () => {


  // Chart.js に dayjs アダプターを明示的に設定
  Chart.defaults.adapters.date = {
    formats: dayjs.Ls.en.formats,
        parse: function (value) {
            return dayjs(value);
        },
        format: function (time, format) {
            return dayjs(time).format(format);
        },
        add: function (time, amount, unit) {
            return dayjs(time).add(amount, unit);
        },
        diff: function (max, min, unit) {
            return dayjs(max).diff(dayjs(min), unit);
        },
        startOf: function (time, unit, weekday) {
            return dayjs(time).startOf(unit);
        },
        endOf: function (time, unit) {
            return dayjs(time).endOf(unit);
        }
    };
    const csvFilePath = 'data2.csv'; // 気温CSVファイルの名前

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
        const lines = csvText.trim().split('\n');
        // ヘッダーもトリム
        const headers = lines[0].split(',').map(header => header.trim());

        return lines.slice(1).map(line => {
            const values = line.split(',');
            const row = {};
            headers.forEach((header, index) => {
                // 値の前後の空白を徹底的にトリム
                // また、values[index] が undefined の場合も考慮して空文字列で初期化
                const valueString = (values[index] || '').trim(); 

                if (header === 'Date') {
                    // 日付は文字列として保持
                    row[header] = valueString;
                } else if (header === 'AvgTemperature') { // ★ここをAvgTemperatureの列名に合わせて修正★
                    // 平均気温は数値に変換
                    // parseFloatを使って、文字列の先頭から数値部分を抽出
                    const numValue = parseFloat(valueString);
                    // NaN（数値でない）の場合は、0 または適切なデフォルト値に設定するか、エラー処理
                    row[header] = isNaN(numValue) ? undefined : numValue; // undefined または 0 にする
                } else {
                    // その他の列は現状維持（必要に応じて同様に数値変換など）
                    row[header] = valueString;
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
            const parsedDate = dayjs(row.Date, 'YYYY-MM-DD'); 

            if (!parsedDate.isValid()) {
                console.error('無効な日付データが見つかりました:', row.Date);
                return null;
            }

            // ★ここも重要: y軸の値がAvgTemperatureとして正しく取得されているか確認
            if (row.AvgTemperature === undefined) {
                 console.error('AvgTemperature のデータが undefined です。CSVヘッダー名を確認してください。');
                 return null; // データが取れていない場合はこの行をスキップ
            }

            return {
                x: row.Date, // parsedDate.valueOf(),
                y: row.AvgTemperature // ここは AvgTemperature のまま
            };
        }).filter(item => item !== null);

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
                            tooltipFormat: 'YYYY-MM-DD',
                            displayFormats: {
                                day: 'MM DD'
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
