import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { NOTYF, notyfFactory } from 'src/app/components/ui/notyf.token';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BackButtonComponent } from './components/buttons/back-button/back-button.component';
import { LogoutButtonComponent } from './components/buttons/logout-button/logout-button.component';
import { ScrollToTopComponent } from './components/buttons/scroll-to-top/scroll-to-top.component';
import { DeleteAlertComponent } from './components/delete-alert/delete-alert.component';
import { CategoriesComponent } from './components/dropdown/categories/categories.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { PeopleInvolvedComponent } from './components/dropdown/people-involved/people-involved.component';
import { FooterComponent } from './components/footer/footer.component';
import { InfoAlertComponent } from './components/info-alert/info-alert.component';
import { AuthenticationComponent } from './pages/authentication/authentication.component';
import { LoginComponent } from './pages/authentication/login/login.component';
import { SignupComponent } from './pages/authentication/signup/signup.component';
import { CreateCategoryComponent } from './pages/diary/create-category/create-category.component';
import { CreateDreamComponent } from './pages/diary/create-dream/create-dream.component';
import { CreatePeopleComponent } from './pages/diary/create-people/create-people.component';
import { DiaryComponent } from './pages/diary/diary.component';
import { DreamListComponent } from './pages/diary/dream-list/dream-list.component';
import { ProfileComponent } from './pages/diary/profile/profile.component';
import { CategoryDonutComponent } from './pages/graphics/category-donut/category-donut.component';
import { GraphicsComponent } from './pages/graphics/graphics.component';
import { PeoplePieComponent } from './pages/graphics/people-pie/people-pie.component';
import { PrivacyDistributionComponent } from './pages/graphics/privacy-distribution/privacy-distribution.component';
import { TopCategoriesComponent } from './pages/graphics/top-categories/top-categories.component';
import { TopPeopleComponent } from './pages/graphics/top-people/top-people.component';
import { HomeComponent } from './pages/home/home.component';
import { PublicPostListComponent } from './pages/home/public-post-list/public-post-list.component';
import { PublicShowProfileComponent } from './pages/home/public-show-profile/public-show-profile.component';
import { TimeAgoPipe } from './pipes/time-ago.pipe';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DiaryComponent,
    LoginComponent,
    AuthenticationComponent,
    SignupComponent,
    FooterComponent,
    BackButtonComponent,
    CreateDreamComponent,
    DreamListComponent,
    DropdownComponent,
    CreateCategoryComponent,
    DeleteAlertComponent,
    CategoriesComponent,
    PeopleInvolvedComponent,
    ScrollToTopComponent,
    CreatePeopleComponent,
    InfoAlertComponent,
    GraphicsComponent,
    CategoryDonutComponent,
    PeoplePieComponent,
    TopCategoriesComponent,
    TopPeopleComponent,
    PrivacyDistributionComponent,
    ProfileComponent,
    LogoutButtonComponent,
    PublicPostListComponent,
    TimeAgoPipe,
    PublicShowProfileComponent
  ],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule, // formularios de tipo plantilla
    ReactiveFormsModule, // formularios de tipo reactivo
    HttpClientModule, // para hacer peticiones http
    ToastrModule.forRoot({
      closeButton: true,
      progressBar: true,
      tapToDismiss: false,
      maxOpened: 1,
      autoDismiss: true,

    }),
  ],
  exports: [
    TimeAgoPipe,
  ],
  providers: [{ provide: NOTYF, useFactory: notyfFactory }],
  bootstrap: [AppComponent]
})
export class AppModule { }
