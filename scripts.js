document.addEventListener('DOMContentLoaded', function () {
    console.log('Document loaded, initializing charts...');

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            console.log('JSON data loaded:', data);

            const totalEvaluations = data['QA Scores for June'].length;
            const teamAverageScore = calculateTeamAverageScore(data['QA Scores for June']);
            const perfectScores = countPerfectScores(data['QA Scores for June']);
            const belowAverage = countBelowAverageScores(data['QA Scores for June'], 95);

            document.getElementById('totalEvaluations').innerText = totalEvaluations;
            document.getElementById('teamAverageScore').innerText = `${teamAverageScore.toFixed(2)}%`;
            document.getElementById('perfectScores').innerText = perfectScores;
            document.getElementById('belowAverage').innerText = belowAverage;

            if (document.getElementById('keyIssuesChart')) {
                initializeKeyIssuesChart(data['Trends']);
            }
            if (document.getElementById('qaQuestionsPerformanceChart')) {
                initializeQAQuestionsPerformanceChart(data['Monthly QA Questions Performance Report']);
            }
            if (document.getElementById('qaScoresBySupervisorChart')) {
                initializeQAScoresBySupervisorChart(data['Monthly QA Scores by Supervisor']);
            }
            if (document.getElementById('departmentQAAveragesChart')) {
                initializeDepartmentQAAveragesChart(data['Department QA Averages']);
            }
            if (document.getElementById('highRollersChart')) {
                initializeHighRollersChart(data['QA Scores for June']);
            }

            console.log('Charts initialized');
        })
        .catch(error => console.error('Error loading JSON data:', error));
});

function calculateTeamAverageScore(data) {
    let totalScore = 0;
    data.forEach(entry => {
        totalScore += entry['Score'];
    });
    return (totalScore / data.length) || 0;
}

function countPerfectScores(data) {
    return data.filter(entry => entry['Score'] === 100).length;
}

function countBelowAverageScores(data, threshold) {
    return data.filter(entry => entry['Score'] < threshold).length;
}

function initializeKeyIssuesChart(data) {
    var ctx = document.getElementById('keyIssuesChart').getContext('2d');
    var totalIssues = data.reduce((sum, d) => sum + d['Count'], 0);
    var keyIssuesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => `${d['Issue']} (${((d['Count'] / totalIssues) * 100).toFixed(1)}%)`),
            datasets: [{
                data: data.map(d => d['Count']),
                backgroundColor: ['#1f3b73', '#FFD700', '#dc3545', '#28a745']
            }]
        },
        options: {
            responsive: true,
            cutout: '50%',
            plugins: {
                datalabels: {
                    formatter: (value, ctx) => {
                        let percentage = (value / totalIssues * 100).toFixed(1) + "%";
                        return percentage;
                    },
                    color: '#fff',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            var value = tooltipItem.raw;
                            var percentage = (value / totalIssues * 100).toFixed(1) + "%";
                            return ` ${value} issues (${percentage})`;
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function initializeQAQuestionsPerformanceChart(data) {
    var ctx = document.getElementById('qaQuestionsPerformanceChart').getContext('2d');
    var qaQuestionsPerformanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d['Question']),
            datasets: [{
                label: 'Highest Percentage Of Items missed on Evaluations',
                data: data.map(d => parseFloat(d['Percentage_No'])),
                backgroundColor: '#28a745',
                borderColor: '#28a745',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    formatter: (value) => value + '%',
                    color: '#555',
                    font: {
                        weight: 'bold'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function initializeQAScoresBySupervisorChart(data) {
    var ctx = document.getElementById('qaScoresBySupervisorChart').getContext('2d');
    var labels = data.map(supervisor => supervisor['Supervisor']);
    var qaScoresBySupervisorChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'June',
                data: data.map(supervisor => supervisor['Scores']['June']),
                backgroundColor: '#dc3545',
                borderColor: '#dc3545',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    formatter: (value) => value + '%',
                    color: '#fff',
                    font: {
                        weight: 'bold'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function initializeDepartmentQAAveragesChart(data) {
    const ctx = document.getElementById('departmentQAAveragesChart').getContext('2d');
    const averageScores = data.map(entry => entry['Average']);
    const labels = data.map(entry => entry['Month']);

    const departmentQAAveragesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'QA Averages',
                data: averageScores,
                backgroundColor: '#dc3545',
                borderColor: '#dc3545',
                borderWidth: 1,
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Months'
                    }
                }
            },
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    formatter: (value) => value + '%',
                    color: '#555',
                    font: {
                        weight: 'bold'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function initializeHighRollersChart(data) {
    var ctx = document.getElementById('highRollersChart').getContext('2d');
    var highRollers = [...new Set(data.filter(analyst => analyst['Score'] === 100).map(analyst => analyst['Analyst']))];
    var highRollersChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: highRollers,
            datasets: [{
                label: 'Monthly High Rollers',
                data: highRollers.map(() => 100),
                backgroundColor: '#FFD700',
                borderColor: '#FFD700',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        },
                        max: 100
                    }
                }
            },
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    formatter: (value) => value + '%',
                    color: '#555',
                    font: {
                        weight: 'bold'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}
