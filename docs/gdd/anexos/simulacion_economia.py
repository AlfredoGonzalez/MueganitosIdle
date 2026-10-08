"""Simulación v0 de la economía de Mueganitos (región 1: Villa Piloncillo).

Uso:  python3 docs/gdd/anexos/simulacion_economia.py

Genera las tablas de 04-economia.md. Cambia las constantes de arriba para probar otros balances.
Modelo: compras óptimas (codiciosas), ferias con puntaje creciente, sesiones cortas y tope offline.
"""
import math

# --- Perillas de balance -------------------------------------------------------------------------
# Puestos: nombre, costo inicial, razón de costo, ingreso/seg por nivel
PUESTOS = [
    ("Comal de la Abuela", 4, 1.07, 0.8),
    ("Vitrina de muéganos", 80, 1.15, 4),
    ("Carrito de feria", 1_500, 1.14, 25),
    ("Mesa en la plaza", 36_000, 1.13, 200),
    ("Kiosko del jardín", 900_000, 1.12, 1_500),
    ("Taller de cajeta", 25_000_000, 1.11, 12_000),
]
HITOS = [25, 50, 100, 200, 300, 400]  # cada hito duplica el ingreso del puesto
FACTOR_PESITOS_FERIA = 0.05           # pesitos = puntos × factor × máx(ingreso/seg, mínimo)
INGRESO_MINIMO_FERIA = 4              # evita que al inicio una feria pague horas de ventas
DIVISOR_PILONCILLO = 5                # piloncillo = ⌊√puntos / divisor⌋
PUNTAJE_PRIMERA_FERIA = 3_000
MEJORA_POR_FERIA = 1.12               # la feria mejora 12 % por partida (Recetario + habilidad)
DIVISOR_ESTRELLAS = 2e8               # estrellas = ⌊√(pesitos región / divisor)⌋

# Jugador modelo
SESIONES_POR_DIA = 6
MINUTOS_POR_SESION = 8
FERIAS_EN_SEGUNDO = (60, 300)         # segundos de la sesión en que termina una feria
HORAS_ENTRE_SESIONES = 2
HORAS_DE_NOCHE = 8
TOPE_OFFLINE_HORAS = 2


def mult_hitos(n):
    return 2 ** sum(1 for h in HITOS if n >= h)


def costo(i, n):
    _, base, razon, _ = PUESTOS[i]
    return base * razon ** n


def ingreso(niveles):
    return sum(PUESTOS[i][3] * n * mult_hitos(n) for i, n in enumerate(niveles))


def piloncillo(puntos):
    return int(math.sqrt(puntos) / DIVISOR_PILONCILLO)


def comprar(pesitos, niveles):
    """Compra repetidamente el nivel con mejor ganancia de ingreso por pesito."""
    while True:
        mejor, elegido = 0, None
        for i in range(len(PUESTOS)):
            c = costo(i, niveles[i])
            if c > pesitos:
                continue
            n = niveles[i]
            delta = PUESTOS[i][3] * ((n + 1) * mult_hitos(n + 1) - n * mult_hitos(n))
            if delta / c > mejor:
                mejor, elegido = delta / c, i
        if elegido is None:
            return pesitos
        pesitos -= costo(elegido, niveles[elegido])
        niveles[elegido] += 1


def jugar(dias, boost):
    pesitos, niveles = 10.0, [0] * len(PUESTOS)
    total, ferias, pilon = 0.0, 0, 0
    filas = []
    for dia in range(1, dias + 1):
        for sesion in range(SESIONES_POR_DIA):
            for seg in range(MINUTOS_POR_SESION * 60):
                inc = ingreso(niveles) * boost
                pesitos += inc
                total += inc
                if seg in FERIAS_EN_SEGUNDO:
                    puntos = PUNTAJE_PRIMERA_FERIA * MEJORA_POR_FERIA ** ferias
                    ganado = puntos * FACTOR_PESITOS_FERIA * max(inc, INGRESO_MINIMO_FERIA)
                    pesitos += ganado
                    total += ganado
                    pilon += piloncillo(puntos)
                    ferias += 1
                pesitos = comprar(pesitos, niveles)
            hueco = HORAS_DE_NOCHE if sesion == SESIONES_POR_DIA - 1 else HORAS_ENTRE_SESIONES
            offline = ingreso(niveles) * boost * min(hueco, TOPE_OFFLINE_HORAS) * 3600
            pesitos += offline
            total += offline
            pesitos = comprar(pesitos, niveles)
        filas.append((dia, ingreso(niveles), total, list(niveles), pilon))
    return filas


def fmt(x):
    for sufijo, valor in (("Qa", 1e15), ("T", 1e12), ("B", 1e9), ("M", 1e6), ("K", 1e3)):
        if x >= valor:
            return f"{x / valor:.1f} {sufijo}"
    return f"{x:,.0f}"


if __name__ == "__main__":
    for boost, titulo in ((1, "Sin anuncios"), (2, "Con boost ×2 de anuncios")):
        print(f"== {titulo} ==")
        for dia, inc, total, niveles, pilon in jugar(4, boost):
            estrellas = int(math.sqrt(total / DIVISOR_ESTRELLAS))
            print(f"  día {dia}: ingreso {fmt(inc)}/s · total {fmt(total)} · niveles {niveles}"
                  f" · piloncillo {pilon} · estrellas si hace Gira {estrellas}")
