import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Chart, registerables } from 'chart.js/auto';

@Component({
  selector: 'app-privacy-distribution',
  templateUrl: './privacy-distribution.component.html',
  styleUrls: ['./privacy-distribution.component.css']
})
export class PrivacyDistributionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() privacyCounts: { [key: string]: number; } = { public: 0, private: 0, friends: 0 };
  public chart: any;

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    if (this.chart) {
      this.updateChart();
    } else {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('privacyCounts' in changes) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  createChart(): void {
    const chartData = this.getChartData();
    this.chart = new Chart("PrivacyPolarAreaChart", {
      type: 'polarArea',
      data: chartData,
      options: {
        responsive: true,
        scales: {
          r: {
            pointLabels: {
              display: true,
              centerPointLabels: true,
              font: {
                size: 18
              }
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Distribución de Sueños por Privacidad'
          }
        }
      }
    });
  }

  updateChart(): void {
    if (this.chart) {
      const chartData = this.getChartData();
      this.chart.data = chartData;
      this.chart.update();
    } else {
      this.createChart();
    }
  }

  getChartData() {
    return {
      labels: ['Público', 'Privado', 'Amigos'],
      datasets: [{
        label: 'Sueños',
        data: [this.privacyCounts['public'], this.privacyCounts['private'], this.privacyCounts['friends']],
        backgroundColor: [
          'rgba(54, 160, 245, 0.2)',
          'rgba(104, 113, 241, 0.2)',
          'rgba(248, 217, 119, 0.2)',
        ],
        borderColor: [
          'rgba(54, 160, 245, 1)',
          'rgba(104, 113, 241, 1)',
          'rgba(248, 217, 119, 1)',
        ],
        borderWidth: 1
      }]
    };
  }
}
