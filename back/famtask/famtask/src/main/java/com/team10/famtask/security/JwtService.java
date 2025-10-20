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
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long expirationTime;

    private Key getSignInKey() {
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Genera un token JWT donde el "subject" es el email del usuario.
     * Incluye claims adicionales como dni, rol y nombre.
     */
    public String generateToken(String dni, String email, String role, String name) {
        return Jwts.builder()
                .setSubject(email) // 🔹 usamos el email como subject (clave principal del usuario)
                .claim("dni", dni)
                .claim("role", role)
                .claim("name", name)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /** Extrae el email (subject) del token */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /** Extrae el rol del token */
    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    /** Extrae el dni si lo necesitás en el futuro */
    public String extractDni(String token) {
        return extractClaim(token, claims -> claims.get("dni", String.class));
    }

    /** Verifica que el token pertenezca al email indicado y no haya expirado */
    public boolean isTokenValid(String token, String email) {
        final String username = extractUsername(token);
        return username.equals(email) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claimsResolver.apply(claims);
    }
}
