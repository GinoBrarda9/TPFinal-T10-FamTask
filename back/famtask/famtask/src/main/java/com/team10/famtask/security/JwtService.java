package com.team10.famtask.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }
    /**
     * Genera un token JWT donde el "subject" es el email del usuario.
     * Incluye claims adicionales como dni, rol y nombre.
     */
    public String generateToken(String email, String dni, String role, String name) {
        Map<String, Object> claims = Map.of(
                "dni", dni,
                "role", role.toUpperCase(),
                "name", name
        );

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(dni)               // ← AHORA EL SUB ES EL DNI
                .claim("role", role)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }


    /** Extrae el email (subject) del token */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /** Extrae el rol del token */
    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    /** Extrae el dni si lo necesitás en el futuro */
    public String extractDni(String token) {
        return extractAllClaims(token).get("dni", String.class);
    }



    // ✅ Nueva sobrecarga, para validar solo la estructura y expiración del token
    public boolean isTokenValid(String token) {
        return !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }


    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
