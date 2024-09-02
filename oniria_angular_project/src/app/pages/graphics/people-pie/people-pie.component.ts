import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Chart, registerables } from 'chart.js/auto';

@Component({
  selector: 'app-people-pie',
  templateUrl: './people-pie.component.html',
  styleUrls: ['./people-pie.component.css']
})
export class PeoplePieComponent implements OnInit, OnDestroy, OnChanges {
  @Input() peoplePostCounts: number[] = [];
  @Input() peopleNames: string[] = [];

  public chart: any;

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    if (this.peoplePostCounts.length > 0 && this.peopleNames.length > 0) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['peoplePostCounts'] || changes['peopleNames']) {
      if (this.peoplePostCounts.length > 0 && this.peopleNames.length > 0) {
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
      this.chart.data.labels = this.peopleNames;
      this.chart.data.datasets[0].data = this.peoplePostCounts;
      this.chart.data.datasets[0].backgroundColor = this.assignRandomColors(this.peoplePostCounts.length);
      this.chart.update();
    } else {
      this.createChart();
    }
  }

  createChart(): void {
    // Crear el gráfico utilizando los peoplePostCounts recibidos como entrada
    if (this.chart) {
      this.chart.destroy(); // Destruir el gráfico existente antes de crear uno nuevo
    }

    this.chart = new Chart("MyPie", {
      type: 'pie',
      data: {
        labels: this.peopleNames,
        datasets: [
          {
            label: 'Sueños',
            data: this.peoplePostCounts,
            backgroundColor: this.assignRandomColors(this.peoplePostCounts.length),
            borderColor: '#292D3E',
            borderWidth: 3
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
            text: '¿Con quién has estado soñando?'
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
