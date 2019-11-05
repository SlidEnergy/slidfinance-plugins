import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
	constructor(
		private auth: AuthService,
		private router: Router
	) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		this.auth.isLoggedIn.subscribe(
			result => {
				if (!result) {
					this.router.navigate(['home']);
				}
			}
		);

		return this.auth.isLoggedIn;
	}

	canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		this.auth.isLoggedIn.subscribe(
			result => {
				if (!result) {
					this.router.navigate(['home']);
				}
			}
		);

		return this.auth.isLoggedIn;
	}
}
