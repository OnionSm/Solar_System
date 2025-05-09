const solveKepler = (M, e, tol = 1e-6) => {
    let E = M; // initial guess
    for (let i = 0; i < 30; i++) {
        const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
        E = E - dE;
        if (Math.abs(dE) < tol) break;
    }
    return E;
}

const meanToTrueAnomaly = (M, e) => {
    const E = solveKepler(M, e);
    const tanHalfNu = Math.sqrt((1 + e) / (1 - e)) * Math.tan(E / 2);
    const nu = 2 * Math.atan(tanHalfNu);
    return (nu + 2 * Math.PI) % (2 * Math.PI); // wrap to [0, 2π]
}

const getTrueAnomalyAfterTime = (t, T, e) => {
    const M = (2 * Math.PI * t) / T;
    return meanToTrueAnomaly(M, e);
}

export default getTrueAnomalyAfterTime;