import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from './models/User.js';
import { IS_DEMO } from './config.js';

// Exporta una función que registra la estrategia en la instancia de passport proporcionada
export default function initPassport(passportInstance = passport) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no está definida. Define JWT_SECRET en backend/.env');
  }

  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret,
  };

  passportInstance.use(
    new JwtStrategy(opts, async (jwtPayload, done) => {
      try {
        const id = jwtPayload?.id || jwtPayload?._id;
        if (!id) {
          return done(null, false);
        }

        if (IS_DEMO) {
          // En modo demo devolvemos un usuario ficticio del payload
          const role = jwtPayload?.role || 'admin';
          return done(null, { _id: id, email: 'admin@iae.com', role });
        }

        const user = await User.findById(id).lean();
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    })
  );
}
