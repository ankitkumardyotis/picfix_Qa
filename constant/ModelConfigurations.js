// Model configurations for AI Image Editor
const modelConfigurations = {
  'generate-image': {
    name: 'Generate Image',
    type: 'prompts',
    creditCost: 2,
    options: ['A sunset over mountains', 'Futuristic city', 'Abstract art', 'Nature landscape', 'Portrait photography']
  },
  'edit-image': {
    name: 'Edit Image',
    type: 'edit-image',
    creditCost: 2,
    options: [
      "Make the person in the image taller",
      "Person should be wearing a red shirt",
    ]
  },
  'hair-style': {
    name: 'Hair Style',
    type: 'hair-style',
    creditCost: 2,
    hairStylesFemale: [
      { id: 1, name: "No change", image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop' },
      { id: 2, name: "Random", image: '/assets/ai-image-editor/hair-cut/female/Random.png' },
      { id: 3, name: "Messy Bun", image: '/assets/ai-image-editor/hair-cut/female/messy-bun.png' },
      { id: 4, name: "Soft Waves", image: '/assets/ai-image-editor/hair-cut/female/soft-wave.png' },
      { id: 5, name: "Blunt Bangs", image: '/assets/ai-image-editor/hair-cut/female/blunt-bang.png' },
      { id: 6, name: "Lob", image: '/assets/ai-image-editor/hair-cut/female/lob.jpg' },
      { id: 7, name: "Layered Shag", image: '/assets/ai-image-editor/hair-cut/female/layered-shag.jpg' },
      { id: 8, name: "High Ponytail", image: '/assets/ai-image-editor/hair-cut/female/high ponytail.png' },
      { id: 9, name: "Straight", image: '/assets/ai-image-editor/hair-cut/female/straight.png' },
      { id: 11, name: "Curly", image: '/assets/ai-image-editor/hair-cut/female/curly.jpg' },
      { id: 13, name: "Pixie Cut", image: '/assets/ai-image-editor/hair-cut/female/pixi-cut.jpg' },
      { id: 15, name: "Low Ponytail", image: '/assets/ai-image-editor/hair-cut/female/low-ponytail.jpg' }
    ],
    hairStylesMale: [
      { id: 1, name: "No change", image: '/assets/ai-image-editor/hair-cut/male/Stylish male model with charismatic smile, in a high-end formal outfit, standing against a neutral studio backdrop, Vogue editorial lighting.jpg' },
      { id: 2, name: "Random", image: '/assets/ai-image-editor/hair-cut/male/random.jpg' },
      { id: 3, name: "Messy Bun", image: '/assets/ai-image-editor/hair-cut/male/messy-bun.jpg' },
      { id: 4, name: "Soft Waves", image: '/assets/ai-image-editor/hair-cut/male/Soft-wave.jpg' },
      { id: 5, name: "Blunt Bangs", image: '/assets/ai-image-editor/hair-cut/male/blunt-bang.jpg' },
      { id: 6, name: "Lob", image: '/assets/ai-image-editor/hair-cut/male/lob.jpg' },
      { id: 7, name: "Layered Shag", image: '/assets/ai-image-editor/hair-cut/male/layered-shag.jpg' },
      { id: 8, name: "High Ponytail", image: '/assets/ai-image-editor/hair-cut/male/high-ponytail.jpg' },
      { id: 9, name: "Straight", image: '/assets/ai-image-editor/hair-cut/male/straight.jpg' },
      { id: 11, name: "Curly", image: '/assets/ai-image-editor/hair-cut/male/curly.jpg' },
      { id: 13, name: "Pixie Cut", image: '/assets/ai-image-editor/hair-cut/male/pixie-cut.jpg' },
      { id: 15, name: "Low Ponytail", image: '/assets/ai-image-editor/hair-cut/male/low-ponytail.jpg' }
    ],

    hairColors: [
      "No change", "Random", "Blonde", "Brunette", "Black", "Dark Brown", "Medium Brown", "Light Brown", "Auburn", "Copper", "Red", "Strawberry Blonde", "Platinum Blonde", "Silver", "White", "Blue", "Purple", "Pink", "Green", "Blue-Black", "Golden Blonde", "Honey Blonde", "Caramel", "Chestnut", "Mahogany", "Burgundy", "Jet Black", "Ash Brown", "Ash Blonde", "Titanium", "Rose Gold"
    ],
    genders: ["Male", "Female"],
    aspectRatios: [
      "match_input_image", "1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "4:5", "5:4", "21:9", "9:21", "2:1", "1:2"
    ]
  },
  'combine-image': {
    name: 'Combine Image',
    type: 'prompts',
    creditCost: 3,
    options: [
      'Put the woman next to the house',
      'Merge the two landscapes together',
      'Combine the person with the background',
      'Place the object in the scene',
      'Blend the two images naturally',
      'Create a composite of both images',
      'Mix the foreground with the background',
      'Combine the elements seamlessly'
    ],
    aspectRatios: [
      "match_input_image", "1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "4:5", "5:4", "21:9", "9:21", "2:1", "1:2"
    ]
  },
  'text-removal': {
    name: 'Remove Watermark',
    type: 'text-removal',
    creditCost: 2,
    aspectRatios: [
      "match_input_image", "1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "4:5", "5:4", "21:9", "9:21", "2:1", "1:2"
    ]
  },
  'headshot': {
    name: 'Headshot',
    type: 'headshot',
    creditCost: 2,
    aspectRatios: [
      "match_input_image", "1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "4:5", "5:4", "21:9", "9:21", "2:1", "1:2"
    ],
    genders: ["Male", "Female", "None"],
    backgrounds: ["White", "Black", "Gray", "Neutral", "Office"]
  },
  'restore-image': {
    name: 'Restore Image',
    type: 'restore-image',
    creditCost: 2
    // No aspect ratios needed for restore-image
  },
  'gfp-restore': {
    name: 'Restore Image',
    type: 'gfp-restore',
    creditCost: 0,
    free: true
    // No aspect ratios needed for gfp-restore
  },
  'home-designer': {
    name: 'Home Designer',
    type: 'prompts',
    creditCost: 0,
    free: true,
    options: [
      'a cheerful modernist bedroom',
      'a cozy living room with fireplace',
      'a minimalist kitchen design',
      'a luxurious bathroom with marble',
      'a contemporary dining room',
      'a rustic home office',
      'a modern apartment interior',
      'a traditional family room'
    ],
    aspectRatios: [
      "match_input_image", "1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "4:5", "5:4", "21:9", "9:21", "2:1", "1:2"
    ]
  },
  'background-removal': {
    name: 'Remove Background',
    type: 'background-removal',
    creditCost: 0,
    free: true
    // No aspect ratios needed for background removal
  },
  'remove-object': {
    name: 'Remove Object',
    type: 'remove-object',
    creditCost: 2
    // No aspect ratios needed for remove object
  },
  're-imagine': {
    name: 'ReImagine',
    type: 're-imagine',
    creditCost: 2,
    genders: ["Male", "Female", "None"],
    aspectRatios: [
      "match_input_image", "1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "4:5", "5:4", "21:9", "9:21", "2:1", "1:2"
    ],
    scenarios: [
      "Random",
      "Floating in space as an astronaut",
      "Walking on the moon surface",
      "Spacewalk outside the International Space Station",
      "Standing on Mars in a spacesuit",
      "Swimming with great white sharks",
      "Deep sea diving with giant whales",
      "Underwater with full scuba gear surrounded by jellyfish",
      "Skydiving from 30,000 feet",
      "Wingsuit flying through mountains",
      "Bungee jumping from a helicopter",
      "Free climbing El Capitan without ropes",
      "Base jumping off a skyscraper",
      "Riding on the back of a great white shark",
      "Standing face-to-face with a roaring lion",
      "Swimming with killer whales in Arctic waters",
      "Gorilla encounter in dense jungle",
      "Running with a pack of cheetahs",
      "Standing in the eye of a hurricane",
      "Surfing a massive tsunami wave",
      "Volcano exploration in heat-proof suit",
      "Lightning strike survivor in a storm",
      "Avalanche escape on skis",
      "Motorcycle jumping over helicopters",
      "Hanging from a helicopter ladder",
      "High-speed car chase as driver",
      "Zipline across the Grand Canyon",
      "Parachuting into a volcano",
      "Flying through clouds without equipment",
      "Superhero landing with impact crater",
      "Dragon encounter in medieval armor",
      "Levitating with magical energy",
      "Standing on top of Mount Everest"
    ]
  },
  'generate-video': {
    name: 'Generate Video',
    type: 'generate-video',
    creditCost: 10,
    models: [
      {
        id: 'kling-v2.5-turbo-pro',
        name: 'Kling V2.5 Turbo Pro',
        provider: 'kwaivgi/kling-v2.5-turbo-pro',
        description: 'High-quality video generation with advanced motion control'
      },
      {
        id: 'bytedance-video',
        name: 'ByteDance Video',
        provider: 'bytedance/video-generator',
        description: 'ByteDance\'s video generation technology'
      },
      {
        id: 'google-gemini-2.5-flash-video',
        name: 'Google Gemini 2.5 Flash Video',
        provider: 'google/gemini-2.5-flash-video',
        description: 'Google\'s advanced video generation model'
      }
    ],
    durations: [5, 10],
    aspectRatios: ["1:1", "16:9", "9:16"],
  },
};

export default modelConfigurations; 