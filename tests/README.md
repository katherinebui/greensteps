# GreenSteps Test Suite

This directory contains a comprehensive test suite for the GreenSteps application, covering unit tests, integration tests, and component tests.

## Test Structure

```
tests/
├── setup.ts                    # Test setup and global mocks
├── lib/                        # Unit tests for utility functions
│   ├── utils.test.ts          # Tests for utility functions
│   ├── schemas.test.ts        # Tests for Zod schema validation
│   ├── carbon.test.ts         # Tests for carbon estimation
│   ├── ai.test.ts             # Tests for AI advice generation
│   └── geo.test.ts            # Tests for geolocation services
├── app/                        # Component tests
│   ├── page.test.tsx          # Tests for home page
│   ├── quiz/page.test.tsx     # Tests for quiz page
│   └── actions.test.ts        # Tests for server actions
└── integration/               # Integration tests
    └── quiz-flow.test.tsx     # End-to-end quiz flow tests
```

## Running Tests

### Available Scripts

- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once and exit
- `npm run test:ui` - Run tests with UI interface
- `npm run test:coverage` - Run tests with coverage report

### Running Specific Tests

```bash
# Run specific test file
npm test tests/lib/utils.test.ts

# Run tests matching a pattern
npm test -- --grep "carbon"

# Run tests in a specific directory
npm test tests/lib/
```

## Test Categories

### 1. Unit Tests (`tests/lib/`)

#### Utils Tests (`utils.test.ts`)
- Tests for the `cn` utility function
- Class name merging and conditional logic
- Edge cases with empty inputs

#### Schema Tests (`schemas.test.ts`)
- Zod schema validation for quiz data
- All valid enum values for each field
- Boundary testing for numeric fields
- Error handling for invalid data

#### Carbon Tests (`carbon.test.ts`)
- Carbon footprint calculation logic
- API integration with Carbon Interface
- Fallback calculations when API fails
- Different heating type calculations
- Flight emission calculations

#### AI Tests (`ai.test.ts`)
- OpenAI API integration
- Prompt construction and formatting
- Error handling for API failures
- Environment variable configuration

#### Geo Tests (`geo.test.ts`)
- Geolocation service integration
- Support for multiple providers (ipinfo, geojs)
- Error handling for API failures
- Partial data handling

### 2. Component Tests (`tests/app/`)

#### Home Page Tests (`page.test.tsx`)
- Rendering of welcome message and description
- Quiz link functionality
- Styling and accessibility

#### Quiz Page Tests (`quiz/page.test.tsx`)
- Form rendering and field validation
- User interactions and state management
- Loading states and error handling
- Results display and formatting

#### Server Actions Tests (`actions.test.ts`)
- Form data processing
- Integration with all services
- Error handling and validation
- Response formatting

### 3. Integration Tests (`tests/integration/`)

#### Quiz Flow Tests (`quiz-flow.test.tsx`)
- Complete user journey from form to results
- State transitions and loading states
- Error scenarios and edge cases
- Form validation and submission

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)
- JSDOM environment for React testing
- Path aliases for clean imports
- Global test setup

### Test Setup (`tests/setup.ts`)
- Global mocks for external dependencies
- Environment variable stubbing
- React Testing Library configuration
- Cleanup between tests

## Mocking Strategy

### External APIs
- Carbon Interface API - Mocked with realistic responses
- OpenAI API - Mocked with controlled responses
- Geolocation services - Mocked with location data

### React Hooks
- `useActionState` - Mocked for server action testing
- Next.js router - Mocked for navigation testing

### Environment Variables
- API keys and configuration stubbed for testing
- Provider selection for geolocation services

## Test Data

### Sample Quiz Data
```typescript
const sampleQuiz = {
  diet: 'omnivore',
  weeklyMilesDriven: 50,
  electricityKwhPerMonth: 400,
  homeHeating: 'electric',
  flightsShortHaulPerYear: 2,
  recyclingHabit: 'often',
  transportMode: 'mixed',
}
```

### Sample API Responses
- Carbon estimation responses with breakdown
- AI advice generation with formatted tips
- Geolocation data with city/region/country

## Best Practices

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### Mocking
- Mock external dependencies consistently
- Use realistic mock data
- Clean up mocks between tests

### Assertions
- Test both happy path and error scenarios
- Verify UI state changes
- Check accessibility attributes

### Coverage
- Aim for high test coverage
- Focus on critical business logic
- Test edge cases and error handling

## Debugging Tests

### Common Issues
1. **Mock not working** - Check mock setup in beforeEach
2. **Async test failures** - Use waitFor for async operations
3. **Component not rendering** - Check for missing mocks

### Debug Commands
```bash
# Run tests with verbose output
npm test -- --verbose

# Run single test with debug
npm test -- --grep "test name" --reporter=verbose

# Run tests with UI for debugging
npm run test:ui
```

## Continuous Integration

The test suite is designed to run in CI environments:
- Fast execution with parallel tests
- No external dependencies
- Consistent results across environments
- Coverage reporting for quality gates

## Future Enhancements

### Planned Test Additions
- E2E tests with Playwright
- Performance testing
- Visual regression testing
- API contract testing

### Test Improvements
- More granular unit tests
- Better error scenario coverage
- Accessibility testing
- Internationalization testing
