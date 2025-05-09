const CalculatePlanetPosition = (minor_axis, major_axis, eccentricity, distance_multiplier, angle) => {
    const p = major_axis * (1 - eccentricity * eccentricity);
    const r = p / (1 + eccentricity * Math.cos(angle));
    const x = r * Math.cos(angle) * distance_multiplier;
    const y = r * Math.sin(angle) * distance_multiplier;
    return {x, y};
}

export default CalculatePlanetPosition;

