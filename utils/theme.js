import { StyleSheet } from 'react-native';

export const colors = {
  background: '#F3E8DC',
  secondary: '#E1D7C6',
  text: '#000000',
  primary: '#7D3A3A',
  title: '#6B2E2E',
  accent: '#A9746E',
};

export const shadows = {
  light: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  pressed: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 16,
    marginVertical: 8,
    ...shadows.light,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.light,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.secondary,
    ...shadows.light,
  },
  title: {
    color: colors.title,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  subtitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
  },
  text: {
    color: colors.text,
    fontSize: 16,
  },
});

export const neumorphic = {
  light: {
    backgroundColor: colors.background,
    borderRadius: 15,
    shadowColor: '#fff',
    shadowOffset: {
      width: -4,
      height: -4,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  dark: {
    backgroundColor: colors.background,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  pressed: {
    backgroundColor: colors.background,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
}; 