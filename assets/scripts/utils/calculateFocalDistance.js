const CalculateFocalDistance = (major_axis, minor_axis) => {
    const focalDistance = Math.sqrt(major_axis*major_axis - minor_axis*minor_axis);
    return focalDistance;
}

export default CalculateFocalDistance;