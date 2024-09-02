import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Chart, registerables } from 'chart.js/auto';

@Component({
  selector: 'app-category-donut',
  templateUrl: './category-donut.component.html',
  styleUrls: ['./category-donut.component.css']
})
export class CategoryDonutComponent implements OnInit, OnDestroy, OnChanges {
  @Input() categoryPostCounts: number[] = [];
  @Input() categoryNames: string[] = []; // Nuevo input para los nombres de las categorías


  public chart: any;

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    if (this.categoryPostCounts.length > 0 && this.categoryNames.length > 0) {
      this.createChart();
    }

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryPostCounts'] || changes['categoryNames']) {
      if (this.categoryPostCounts.length > 0 && this.categoryNames.length > 0) {
        this.updateChart();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  updateChart(): void {
    if (this.chart) {
      this.chart.data.labels = this.categoryNames.map(name => name.toLowerCase());
      this.chart.data.datasets[0].data = this.categoryPostCounts;
      this.chart.data.datasets[0].backgroundColor = this.assignRandomColors(this.categoryPostCounts.length);
      this.chart.update();
    } else {
      this.createChart();
    }
  }

  createChart(): void {
    // Crear el gráfico utilizando los categoryPostCounts recibidos como entrada
    if (this.chart) {
      this.chart.destroy(); // Destruir el gráfico existente antes de crear uno nuevo
    }

    this.chart = new Chart("MyDonut", {
      type: 'doughnut',
      data: {
        labels: this.categoryNames,
        datasets: [
          {
            label: 'Sueños',
            data: this.categoryPostCounts,
            backgroundColor: this.assignRandomColors(this.categoryPostCounts.length),
            borderColor: '#292D3E',
            borderWidth: 5
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: '¿De qué han ido tus sueños últimamente?'
          }
        }
      }
    });
  }

  assignRandomColors(count: number): string[] {
    const colors = ['#36A0F5', '#8BC7F8', '#5EB2F7', '#0F8AF0', '#0479DA', '#6871f1', '#BCC1FB', '#8D95F6', '#4652E9', '#494FBC', '#8D92E7', '#F8D977', '#FFF2C8', '#FFE8A0', '#D5B44A'];
    const randomColors: string[] = [];

    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * colors.length);
      randomColors.push(colors[index]);
    }

    return randomColors;
  }
}
