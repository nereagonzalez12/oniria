import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Chart, registerables } from 'chart.js/auto';

@Component({
  selector: 'app-top-categories',
  templateUrl: './top-categories.component.html',
  styleUrls: ['./top-categories.component.css']
})
export class TopCategoriesComponent implements OnInit, OnChanges, OnDestroy {
  @Input() topCategories: { name: string, count: number; }[] = [];
  public chart: any;
  private isChartInitialized = false; // Bandera para controlar la inicialización del gráfico

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('topCategories' in changes) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  createChart(): void {
    if (this.isChartInitialized) return; // Salir si el gráfico ya está inicializado

    const chartData = this.getChartData();
    this.chart = new Chart("MyCategoryBar", {
      type: 'bar',
      data: chartData,
      options: {
        indexAxis: 'y',
        responsive: true,
        elements: {
          bar: {
            borderWidth: 2,
          }
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Top 5: Etiquetas más usadas'
          }
        }
      }
    });

    this.isChartInitialized = true; // Marcar el gráfico como inicializado
  }

  updateChart(): void {
    if (this.chart) {
      const chartData = this.getChartData();
      this.chart.data.labels = chartData.labels;
      this.chart.data.datasets = chartData.datasets;
      this.chart.update();
    } else {
      this.createChart();
    }
  }

  getChartData() {
    return {
      labels: this.topCategories.map(c => c.name.toLowerCase()),
      datasets: [{
        label: 'Sueños',
        data: this.topCategories.map(c => c.count),
        backgroundColor: 'rgba(248, 217, 119, 0.2)',
        borderColor: 'rgba(248, 217, 119, 1)',
        borderWidth: 1
      }]
    };
  }
}
