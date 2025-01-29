function Hero() {
  return (
    <div className="relative bg-gradient-to-b from-[#CDC1FF] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight  text-white sm:text-5xl md:text-6xl">
            Help Find Missing Persons
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-[#A294F9]">
            Join our community effort to reunite families. Report sightings, search missing persons database, and help make a difference.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <a
              href="/report"
              className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-[#A294F9] hover:bg-indigo-50"
            >
              Report Missing Person
            </a>
            <a
              href="/search"
              className="rounded-md bg-[#A294F9] px-6 py-3 text-lg font-semibold text-white border border-white hover:bg-[#CDC1FF]"
            >
              Search Database
            </a>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
}

export default Hero;