import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Chart, registerables } from 'chart.js/auto';

@Component({
  selector: 'app-top-people',
  templateUrl: './top-people.component.html',
  styleUrls: ['./top-people.component.css']
})
export class TopPeopleComponent implements OnInit, OnChanges, OnDestroy {
  @Input() topPeople: { name: string, count: number; }[] = [];
  public chart: any;
  private isChartInitialized = false; // Bandera para controlar la inicialización del gráfico

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('topPeople' in changes) {
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
    this.chart = new Chart("MyPeopleBar", {
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
            text: 'Top 5: Intrusos más recurrentes'
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
      labels: this.topPeople.map(c => c.name),
      datasets: [{
        label: 'Sueños',
        data: this.topPeople.map(c => c.count),
        backgroundColor: 'rgba(54, 160, 245, 0.2)',
        borderColor: 'rgba(54, 160, 245, 1)',
        borderWidth: 1
      }]
    };
  }
}
