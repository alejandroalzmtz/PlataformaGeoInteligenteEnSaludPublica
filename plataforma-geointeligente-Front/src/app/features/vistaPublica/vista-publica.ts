import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CarouselModule } from 'primeng/carousel';
import { Nav } from '../../core/components/nav/nav';
import { AuthService } from '../../core/services/auth.service';
import { NoticiaService, Noticia } from '../../core/services/noticia.service';
import { NewCardComponent } from '../../core/components/news/new-card';

@Component({
  selector: 'app-public-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AvatarModule,
    ButtonModule,
    RippleModule,
    CarouselModule,
    NewCardComponent,
    Nav
  ],
  templateUrl: './vista-publica.html',
  styleUrls: ['./vista-publica.css']
})
export class PublicView implements OnInit, OnDestroy {
  // ========== HERO SECTION DATA ==========
  mainStats = [
    { number: '137M', label: 'Registros de Pacientes' },
    { number: '1K', label: 'Hospitales' },
    { number: '32', label: 'Estados' },
    { number: '24', label: 'Años de Datos' }
  ];

  // ========== FEATURES SECTION DATA ==========
  features = [
    {
      icon: 'fas fa-map-marked-alt',
      title: 'Análisis geoespacial multinivel',
      description: 'Mapas coropléticos interactivos con representación de incidencia por estado, municipio y localidad. Incluye visualización de gradientes epidemiológicos y clustering espacial mediante técnicas de geoprocesamiento.'
    },
    {
      icon: 'fas fa-chart-bar',
      title: 'Paneles epidemiológicos especializados',
      description: 'Dashboards configurables para cáncer de mama y otras enfermedades de interés en salud pública. Análisis de series temporales, distribución por grupo etario, sexo y derechohabiencia.'
    },
    {
      icon: 'fas fa-database',
      title: 'Integración de registros médicos',
      description: 'Sistema de gestión de egresos hospitalarios con validación de diagnósticos CIE-10, trazabilidad de factores epidemiológicos y exportación de datasets para análisis estadístico avanzado.'
    }
  ];

  // ========== CANCER DATA SECTION DATA ==========
  analysisItems = [
    {
      key: 'clues',
      icon: 'fas fa-hospital',
      title: 'Establecimientos (CLUES)',
      detail: 'Origen hospitalario para análisis por centro y red de atención.'
    },
    {
      key: 'estados',
      icon: 'fas fa-map-marker-alt',
      title: 'Estados (prevalencia/incidencia)',
      detail: 'Identificación geográfica de entidades con mayor carga de enfermedad.'
    },
    {
      key: 'mortalidad',
      icon: 'fas fa-chart-line',
      title: 'Tasa de mortalidad',
      detail: 'Cálculo y comparativa de tasas de mortalidad por unidad poblacional.'
    },
    {
      key: 'estancia',
      icon: 'fas fa-procedures',
      title: 'Días de estancia por edad',
      detail: 'Duración promedio de estancia hospitalaria desagregada por edad.'
    }
  ];

  panelIntro = `El sistema incluye un panel dedicado al análisis del cáncer de mama en mujeres. El objetivo del panel es consolidar datos de atención y vigilancia para apoyar el seguimiento epidemiológico, la priorización territorial y la toma de decisiones sanitarias basadas en evidencia. A continuación se listan las principales variables y dimensiones que se analizarán para la generación de gráficos y reportes.`;

  // ========== NEWS SECTION DATA ==========
  newsSlides: Array<{ image: string; titulo?: string; contenido?: string }> = [];
  displaySlides: Array<{ image: string; titulo?: string; contenido?: string }> = [];
  responsiveOptions: any[] = [];
  private resizeHandler = () => {
    this.updateNavOffset();
  };

  private updateNavOffset(): void {
    try {
      const header = document.querySelector('.header') as HTMLElement | null;
      const h = header ? header.offsetHeight : 70;
      // set CSS variable on root and ensure container has same padding as fallback
      document.documentElement.style.setProperty('--nav-height', `${h}px`);
      const container = document.querySelector('.public-view-container') as HTMLElement | null;
      if (container) container.style.paddingTop = `${h}px`;
    } catch (e) {
      // silent
    }
  }



  // ========== EDUCATIONAL CONTENT DATA ==========
  eduSlides = [
    {
      title: '¿Qué es el cáncer de mama?',
      summary: `Es una enfermedad en la que las células del tejido mamario se multiplican sin control.
Existen varios tipos de cáncer de mama, algunos se desarrollan de manera lenta, mientras que otros son más agresivos.

Sin embargo, la mayoría puede tratarse si se detecta a tiempo.

El cáncer de mama es uno de los padecimientos más comunes entre las mujeres en México y en el mundo.

Se origina cuando las células del seno comienzan a crecer de manera anormal y descontrolada, formando tumores que pueden ser benignos o malignos.`
    },
    {
      title: 'Factores de riesgo',
      riskList: [
        { icon: 'fas fa-users', title: 'Etnia :', description: ' Las mujeres con mayor ascendencia europea tienen más riesgo de cáncer de mama. El norte del país (más ascendencia europea) presenta más casos que el sur (más indígena).' },
        { icon: 'fas fa-user-friends', title: 'Historial familiar :', description: ' El riesgo se duplica si un familiar directo ha tenido cáncer de mama. Hasta 80% de las pacientes con cáncer de mama y ovario tienen antecedentes familiares.' }
      ]
    },
    {
      title: 'Factores de riesgo',
      riskList: [
        { icon: 'fas fa-user-md', title: 'Historial personal :', description: ' Haber tenido cáncer en una mama duplica el riesgo en la otra. Enfermedades benignas de mama como papiloma o hiperplasia pueden aumentar el riesgo hasta 5 veces.' },
        { icon: 'fas fa-baby', title: 'Historial reproductivo :', description: ' La lactancia materna protege contra el cáncer de mama. No haber tenido hijos (nuliparidad) o tener menarquía temprana puede aumentar el riesgo. La terapia hormonal posmenopáusica puede incrementar el riesgo.' }
      ]
    },
    {
      title: 'Factores de riesgo',
      riskList: [
        { icon: 'fas fa-vial', title: 'Mutaciones genéticas (BRCA1/2): ', description: ' Portar mutaciones en estos genes puede elevar el riesgo hasta 80%. En México, 15% de las pacientes tienen mutaciones BRCA1/2, especialmente las menores de 50 años. Las pruebas genéticas suelen ser caras y de difícil acceso en hospitales públicos.' },
        { icon: 'fas fa-birthday-cake', title: 'Edad :', description: ' El grupo con más casos está entre 50 y 59 años, pero cada vez hay más diagnósticos en mujeres menores de 40 años.' }
      ]
    },
    {
      title: 'Factores de riesgo',
      riskList: [
        { icon: 'fas fa-running', title: 'Estilo de vida :', description: ' Cambios en los hábitos y la industrialización influyen fuertemente.' },
        { icon: 'fas fa-weight', title: 'Sobrepeso y obesidad :', description: 'Asociados a mayor riesgo, especialmente si hay inactividad física y mala alimentación. Muchas pacientes también presentan diabetes o presión alta.' }
      ]
    },
    {
      title: 'Factores de riesgo',
      riskList: [
        { icon: 'fas fa-bread-slice', title: 'Dieta :', description: 'El alto consumo de carbohidratos simples (harinas, pan, refrescos) aumenta el riesgo. Los flavonoides (frutas, semillas) pueden tener un efecto protector.' },
        { icon: 'fas fa-wine-bottle', title: 'Alcohol y tabaco :', description: 'El alcohol afecta la reparación del ADN y aumenta el riesgo. Fumar por más de 30 años o la exposición al humo también incrementa la probabilidad.' }
      ]
    },
    {
      title: 'Factores de riesgo',
      riskList: [
        { icon: 'fas fa-moon', title: 'Alteraciones del sueño', description: 'Trabajar turnos nocturnos o dormir menos de 6 horas aumenta hasta 9 veces el riesgo de desarrollar cáncer de mama.' }
      ]
    }
  ];

  currentEduIndex = 0;

  // ========== GUIDED VIEW (full-screen sections) ==========
  currentSectionIndex = 0;
  guidedSections = [
    { id: 'hero', title: 'Inicio', icon: 'fas fa-home' },
    { id: 'features', title: 'Sobre la Plataforma', icon: 'fas fa-info-circle' },
    { id: 'cancer', title: 'Datos Epidemiológicos', icon: 'fas fa-chart-bar' },
    { id: 'news', title: 'Noticias', icon: 'fas fa-newspaper' }
  ];

  constructor(
    public authService: AuthService, 
    private router: Router,
    private noticiaService: NoticiaService
  ) {}

  ngOnInit(): void {
    // Setup responsive news carousel
    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 4,
        numScroll: 1
      },
      {
        breakpoint: '1280px',
        numVisible: 3,
        numScroll: 1
      },
      {
        breakpoint: '960px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '600px',
        numVisible: 1,
        numScroll: 1
      }
    ];
    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('keydown', (e) => this.handleKeyNavigation(e));

    // Load news from backend
    this.noticiaService.getNoticias().subscribe({
      next: (data: Noticia[]) => {
        this.newsSlides = (data || []).map(n => ({
          image: n.imagenPrincipal || 'images/no-image.jpg',
          titulo: n.titulo || '',
          contenido: n.contenido || ''
        }));
        this.displaySlides = this.newsSlides;
      },
      error: (err: any) => {
        console.error('Error cargando noticias', err);
      }
    });
  }

  ngAfterViewInit(): void {
    // ensure content offset matches actual header height after nav is rendered
    setTimeout(() => this.updateNavOffset(), 0);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('keydown', (e) => this.handleKeyNavigation(e));
  }

  // ========== HEADER METHODS ==========
  goToLogin() {
    this.router.navigate(['/login']);
  }



  // ========== EDUCATIONAL CAROUSEL METHODS ==========
  nextEduSlide() {
    this.currentEduIndex = (this.currentEduIndex + 1) % this.eduSlides.length;
  }

  // ========== GUIDED VIEW METHODS ==========
  handleKeyNavigation(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.nextSection();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.prevSection();
    }
  }

  nextSection(): void {
    if (this.currentSectionIndex < this.guidedSections.length - 1) {
      this.currentSectionIndex++;
      this.scrollToSection(this.guidedSections[this.currentSectionIndex].id);
    }
  }

  prevSection(): void {
    if (this.currentSectionIndex > 0) {
      this.currentSectionIndex--;
      this.scrollToSection(this.guidedSections[this.currentSectionIndex].id);
    }
  }

  private scrollToSection(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      const rect = element.getBoundingClientRect();
      const scrollTop = rect.top + window.scrollY;
      window.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  }

  // ========== AUTH METHODS (for future use) ==========
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  getCurrentUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.name || '';
  }

  getCurrentUserRole(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '';
    return user.role === 'admin' ? 'Administrador' : 'Usuario';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/about-us']);
  }
}
