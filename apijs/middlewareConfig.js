export function redirectHTML(app){
    app.use((req, res, next) => {
        if (req.path.endsWith('mainpage.html')) {
            // If the request path ends with .html, redirect it
            return res.redirect('/');
        }
        // If the request path doesn't end with .html, proceed to the next middleware
        next();
    });
    
    app.use((req, res, next) => {
        if (req.path.endsWith('login.html')) {
            // If the request path ends with .html, redirect to /profile
            return res.redirect('/login');
        }
        // If the request path doesn't end with .html, proceed to the next middleware
        next();
    });
    
    app.use((req, res, next) => {
        if (req.path.endsWith('register.html')) {
            // If the request path ends with .html, redirect to /profile
            return res.redirect('/register');
        }
        // If the request path doesn't end with .html, proceed to the next middleware
        next();
    });

    app.use((req, res, next) => {
        if (req.path.endsWith('profile.html')) {
            // If the request path ends with .html, redirect to /profile
            return res.redirect('/profile');
        }
        // If the request path doesn't end with .html, proceed to the next middleware
        next();
    });

    app.use((req, res, next) => {
        if (req.path.endsWith('payment.html')) {
            // If the request path ends with .html, redirect to /profile
            return res.redirect('/payment');
        }
        // If the request path doesn't end with .html, proceed to the next middleware
        next();
    });

    app.use((req, res, next) => {
        if (req.path.endsWith('callback.html')) {
            // If the request path ends with .html, redirect to /profile
            return res.redirect('/callback');
        }
        // If the request path doesn't end with .html, proceed to the next middleware
        next();
    });

    app.use((req, res, next) => {
        if (req.path.endsWith('pricing.html')) {
            // If the request path ends with .html, redirect to /profile
            return res.redirect('/pricing');
        }
        // If the request path doesn't end with .html, proceed to the next middleware
        next();
    });

    app.use((req, res, next) => {
        if (req.path.endsWith('gizlilikvecerez.html')) {
            // If the request path ends with .html, redirect to /profile
            return res.redirect('/gizlilik-ve-cerez');
        }
        // If the request path doesn't end with .html, proceed to the next middleware
        next();
    });

    app.use((req, res, next) => {
        if (req.path.endsWith('forgotPassword.html')) {
            // If the request path ends with .html, redirect to /profile
            return res.redirect('/forgotPassword');
        }
        // If the request path doesn't end with .html, proceed to the next middleware
        next();
    });

    app.use((req, res, next) => {
        if (req.path.endsWith('about.html')) {
            // If the request path ends with .html, redirect to /profile
            return res.redirect('/hakkinda');
        }
        // If the request path doesn't end with .html, proceed to the next middleware
        next();
    });
}