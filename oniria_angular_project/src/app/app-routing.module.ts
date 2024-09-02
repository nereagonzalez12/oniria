import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { loggedGuard } from './guards/logged.guard';
import { AuthenticationComponent } from './pages/authentication/authentication.component';
import { LoginComponent } from './pages/authentication/login/login.component';
import { SignupComponent } from './pages/authentication/signup/signup.component';
import { DiaryComponent } from './pages/diary/diary.component';
import { GraphicsComponent } from './pages/graphics/graphics.component';
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
  { path: '', component: AuthenticationComponent, canActivate: [loggedGuard] },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'diary', component: DiaryComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent, canActivate: [loggedGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [loggedGuard] },
  { path: 'graphics', component: GraphicsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/diary', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
